/**
 * File: backend/controllers/cartController.js
 * Purpose: Business logic and handlers for database-backed shopping cart management.
 */
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

const POPULATE_PRODUCT_FIELDS = 'name price images slug category stock packageSize weight specifications';

// Helper to populate all nested product references in cart
const populateCart = async (cartQuery) => {
  return await cartQuery
    .populate('items.mainProduct', POPULATE_PRODUCT_FIELDS)
    .populate('items.completedContainers.items.product', POPULATE_PRODUCT_FIELDS)
    .populate('items.activeContainer.items.product', POPULATE_PRODUCT_FIELDS)
    .populate('items.extraItems.product', POPULATE_PRODUCT_FIELDS);
};

// Helper to calculate total items (sum of quantities) and total amount
const calculateCartTotals = (items = []) => {
  let totalItems = 0;
  let totalAmount = 0;

  (items || []).forEach(item => {
    if (!item) return;
    const qty = Number(item.mainQuantity) || Number(item.totalContainers) || 1;
    totalItems += qty;
    const price = Number(item.mainProduct?.price) || 0;
    totalAmount += price * qty;
  });

  return { totalItems, totalAmount };
};

// Helper to sync User.cart on User model for backward compatibility
const syncUserCart = async (userId, cartItems = []) => {
  try {
    const user = await User.findById(userId);
    if (user) {
      user.cart = (cartItems || [])
        .filter(item => Boolean(item && item.mainProduct))
        .map(item => ({
          product: item.mainProduct._id || item.mainProduct,
          quantity: Number(item.mainQuantity) || Number(item.totalContainers) || 1,
        }));
      await user.save();
    }
  } catch (err) {
    console.warn('syncUserCart warning:', err.message);
  }
};

// @desc    Get user's shopping cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res) => {
  try {
    let cart = await populateCart(Cart.findOne({ user: req.user._id }));

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    const { totalItems, totalAmount } = calculateCartTotals(cart.items || []);

    res.status(200).json({
      success: true,
      data: cart.items || [],
      cart: cart.items || [],
      totalItems,
      totalAmount,
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add item/configuration to cart
// @route   POST /api/cart
// @access  Private
export const addToCart = async (req, res) => {
  try {
    const {
      mainProductId,
      productId,
      containerType = '20FT',
      completedContainers = [],
      activeContainer = { containerType: '20FT', totalLoad: 0, items: [] },
      extraItems = [],
      mainQuantity,
      quantity,
      totalContainers,
      cartItemId,
      increment = true,
    } = req.body;

    const targetProductId = mainProductId || productId;
    if (!targetProductId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    const mainProduct = await Product.findById(targetProductId);
    if (!mainProduct) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Stock availability check
    if (mainProduct.stock !== undefined && mainProduct.stock !== null && Number(mainProduct.stock) <= 0) {
      return res.status(400).json({ success: false, message: 'Product is currently out of stock' });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // Determine incoming quantity
    let incomingQty = 1;
    if (quantity !== undefined && quantity !== null) {
      incomingQty = Number(quantity);
    } else if (mainQuantity !== undefined && mainQuantity !== null) {
      incomingQty = Number(mainQuantity);
    }

    // Check if user is removing by sending quantity <= 0
    const isZeroQuantity = incomingQty <= 0 && 
      (!completedContainers || completedContainers.length === 0) &&
      (!activeContainer || Number(activeContainer.totalLoad || 0) <= 0);

    if (isZeroQuantity) {
      if (cartItemId) {
        cart.items = cart.items.filter(item => item._id.toString() !== cartItemId);
      } else {
        cart.items = cart.items.filter(item => item.mainProduct.toString() !== targetProductId.toString());
      }
      await cart.save();
      const updatedCart = await populateCart(Cart.findById(cart._id));
      await syncUserCart(req.user._id, updatedCart.items || []);
      const { totalItems, totalAmount } = calculateCartTotals(updatedCart.items || []);
      return res.status(200).json({
        success: true,
        message: 'Item removed from cart',
        data: updatedCart.items || [],
        cart: updatedCart.items || [],
        totalItems,
        totalAmount,
      });
    }

    const isComplexConfiguration = completedContainers && completedContainers.length > 0;

    const newItemData = {
      mainProduct: targetProductId,
      containerType: containerType || '20FT',
      completedContainers: (completedContainers || []).map(c => ({
        containerNumber: Number(c.containerNumber),
        containerType: c.containerType || containerType || '20FT',
        totalLoad: Number(c.totalLoad || 1.00),
        items: (c.items || []).map(i => ({
          product: i.product._id || i.product.id || i.product,
          quantity: Number(i.quantity),
        })),
        completedAt: c.completedAt || new Date(),
      })),
      activeContainer: {
        containerType: activeContainer?.containerType || containerType || '20FT',
        totalLoad: Number(activeContainer?.totalLoad || 0),
        items: (activeContainer?.items || []).map(i => ({
          product: i.product._id || i.product.id || i.product,
          quantity: Number(i.quantity),
        })),
      },
      extraItems: (extraItems || []).map(i => ({
        product: i.product._id || i.product.id || i.product,
        quantity: Number(i.quantity),
      })),
      mainQuantity: incomingQty,
      totalContainers: Number(totalContainers) > 0 ? Number(totalContainers) : incomingQty,
      configurationSnapshot: {
        savedAt: new Date().toISOString(),
        containerType: containerType || '20FT',
      },
    };

    // If updating an existing cart item by ID (Edit flow)
    if (cartItemId) {
      const existingIndex = cart.items.findIndex(item => item._id.toString() === cartItemId);
      if (existingIndex > -1) {
        cart.items[existingIndex] = { ...cart.items[existingIndex].toObject(), ...newItemData };
      } else {
        cart.items.push(newItemData);
      }
    } else {
      // Find existing item with same product ID
      const existingIndex = cart.items.findIndex(item => {
        return item.mainProduct.toString() === targetProductId.toString() &&
          item.containerType === (containerType || '20FT');
      });

      if (existingIndex > -1) {
        const existingItem = cart.items[existingIndex];
        if (isComplexConfiguration) {
          // Replace with updated complex container configuration
          cart.items[existingIndex] = { ...existingItem.toObject(), ...newItemData };
        } else {
          // Increment existing quantity without creating duplicate entry
          const currentQty = Number(existingItem.mainQuantity) || Number(existingItem.totalContainers) || 1;
          const newQty = increment ? (currentQty + incomingQty) : incomingQty;
          existingItem.mainQuantity = newQty;
          existingItem.totalContainers = newQty;
        }
      } else {
        cart.items.push(newItemData);
      }
    }

    await cart.save();

    const updatedCart = await populateCart(Cart.findById(cart._id));
    await syncUserCart(req.user._id, updatedCart.items || []);

    const { totalItems, totalAmount } = calculateCartTotals(updatedCart.items || []);

    res.status(200).json({
      success: true,
      message: 'Cart updated successfully',
      data: updatedCart.items || [],
      cart: updatedCart.items || [],
      totalItems,
      totalAmount,
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a specific cart item
// @route   PUT /api/cart/:itemId
// @access  Private
export const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: 'Cart item not found' });
    }

    const {
      mainProductId,
      productId,
      containerType,
      completedContainers,
      activeContainer,
      extraItems,
      mainQuantity,
      quantity,
      totalContainers,
    } = req.body;

    const newQty = quantity !== undefined ? Number(quantity) : (mainQuantity !== undefined ? Number(mainQuantity) : undefined);

    if (newQty !== undefined && newQty <= 0 && (!completedContainers || completedContainers.length === 0)) {
      cart.items = cart.items.filter(item => item._id.toString() !== itemId);
      await cart.save();
      const updatedCart = await populateCart(Cart.findById(cart._id));
      await syncUserCart(req.user._id, updatedCart.items || []);
      const { totalItems, totalAmount } = calculateCartTotals(updatedCart.items || []);
      return res.status(200).json({
        success: true,
        message: 'Cart item removed due to zero quantity',
        data: updatedCart.items || [],
        cart: updatedCart.items || [],
        totalItems,
        totalAmount,
      });
    }

    const targetProductId = mainProductId || productId;
    if (targetProductId) cart.items[itemIndex].mainProduct = targetProductId;
    if (containerType) cart.items[itemIndex].containerType = containerType;
    if (completedContainers) {
      cart.items[itemIndex].completedContainers = completedContainers.map(c => ({
        containerNumber: Number(c.containerNumber),
        containerType: c.containerType || containerType || '20FT',
        totalLoad: Number(c.totalLoad || 1.00),
        items: (c.items || []).map(i => ({
          product: i.product._id || i.product.id || i.product,
          quantity: Number(i.quantity),
        })),
        completedAt: c.completedAt || new Date(),
      }));
    }
    if (activeContainer) {
      cart.items[itemIndex].activeContainer = {
        containerType: activeContainer.containerType || containerType || '20FT',
        totalLoad: Number(activeContainer.totalLoad || 0),
        items: (activeContainer.items || []).map(i => ({
          product: i.product._id || i.product.id || i.product,
          quantity: Number(i.quantity),
        })),
      };
    }
    if (extraItems) {
      cart.items[itemIndex].extraItems = extraItems.map(i => ({
        product: i.product._id || i.product.id || i.product,
        quantity: Number(i.quantity),
      }));
    }
    if (newQty !== undefined) {
      cart.items[itemIndex].mainQuantity = newQty;
      cart.items[itemIndex].totalContainers = newQty;
    }
    if (totalContainers !== undefined) cart.items[itemIndex].totalContainers = Number(totalContainers);

    await cart.save();

    const updatedCart = await populateCart(Cart.findById(cart._id));
    await syncUserCart(req.user._id, updatedCart.items || []);

    const { totalItems, totalAmount } = calculateCartTotals(updatedCart.items || []);

    res.status(200).json({
      success: true,
      message: 'Cart item updated successfully',
      data: updatedCart.items || [],
      cart: updatedCart.items || [],
      totalItems,
      totalAmount,
    });
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove an item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
export const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = cart.items.filter(item => item._id.toString() !== itemId);
    await cart.save();

    const updatedCart = await populateCart(Cart.findById(cart._id));
    await syncUserCart(req.user._id, updatedCart.items || []);

    const { totalItems, totalAmount } = calculateCartTotals(updatedCart.items || []);

    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      data: updatedCart.items || [],
      cart: updatedCart.items || [],
      totalItems,
      totalAmount,
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Clear user's cart completely
// @route   DELETE /api/cart
// @access  Private
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    await syncUserCart(req.user._id, []);

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      data: [],
      cart: [],
      totalItems: 0,
      totalAmount: 0,
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
