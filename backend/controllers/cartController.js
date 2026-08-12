/**
 * File: backend/controllers/cartController.js
 * Purpose: Business logic and handlers for database-backed shopping cart management.
 */
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

const POPULATE_PRODUCT_FIELDS = 'name price images slug category stock packageSize weight specifications';

// Helper to populate all nested product references in cart
const populateCart = async (cartQuery) => {
  return await cartQuery
    .populate('items.mainProduct', POPULATE_PRODUCT_FIELDS)
    .populate('items.completedContainers.items.product', POPULATE_PRODUCT_FIELDS)
    .populate('items.activeContainer.items.product', POPULATE_PRODUCT_FIELDS)
    .populate('items.extraItems.product', POPULATE_PRODUCT_FIELDS);
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

    res.status(200).json({
      success: true,
      data: cart.items || [],
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
      containerType = '20FT',
      completedContainers = [],
      activeContainer = { containerType: '20FT', totalLoad: 0, items: [] },
      extraItems = [],
      mainQuantity = 0,
      totalContainers = 1,
      cartItemId,
    } = req.body;

    if (!mainProductId) {
      return res.status(400).json({ success: false, message: 'mainProductId is required' });
    }

    const mainProduct = await Product.findById(mainProductId);
    if (!mainProduct) {
      return res.status(404).json({ success: false, message: 'Main product not found' });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const newItemData = {
      mainProduct: mainProductId,
      containerType,
      completedContainers: (completedContainers || []).map(c => ({
        containerNumber: Number(c.containerNumber),
        containerType: c.containerType || containerType,
        totalLoad: Number(c.totalLoad || 1.00),
        items: (c.items || []).map(i => ({
          product: i.product._id || i.product.id || i.product,
          quantity: Number(i.quantity),
        })),
        completedAt: c.completedAt || new Date(),
      })),
      activeContainer: {
        containerType: activeContainer.containerType || containerType,
        totalLoad: Number(activeContainer.totalLoad || 0),
        items: (activeContainer.items || []).map(i => ({
          product: i.product._id || i.product.id || i.product,
          quantity: Number(i.quantity),
        })),
      },
      extraItems: (extraItems || []).map(i => ({
        product: i.product._id || i.product.id || i.product,
        quantity: Number(i.quantity),
      })),
      mainQuantity: Number(mainQuantity),
      totalContainers: Number(totalContainers),
      configurationSnapshot: {
        savedAt: new Date().toISOString(),
        containerType,
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
      // Check for duplicate identical configuration
      const duplicateIndex = cart.items.findIndex(item => {
        return item.mainProduct.toString() === mainProductId &&
          item.containerType === containerType &&
          JSON.stringify(item.completedContainers) === JSON.stringify(newItemData.completedContainers);
      });

      if (duplicateIndex > -1) {
        // Update existing duplicate item with latest configuration
        cart.items[duplicateIndex] = { ...cart.items[duplicateIndex].toObject(), ...newItemData };
      } else {
        cart.items.push(newItemData);
      }
    }

    await cart.save();

    const updatedCart = await populateCart(Cart.findById(cart._id));

    res.status(200).json({
      success: true,
      message: 'Container configuration saved to cart',
      data: updatedCart.items || [],
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
      containerType,
      completedContainers,
      activeContainer,
      extraItems,
      mainQuantity,
      totalContainers,
    } = req.body;

    if (mainProductId) cart.items[itemIndex].mainProduct = mainProductId;
    if (containerType) cart.items[itemIndex].containerType = containerType;
    if (completedContainers) {
      cart.items[itemIndex].completedContainers = completedContainers.map(c => ({
        containerNumber: Number(c.containerNumber),
        containerType: c.containerType || containerType,
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
        containerType: activeContainer.containerType || containerType,
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
    if (mainQuantity !== undefined) cart.items[itemIndex].mainQuantity = Number(mainQuantity);
    if (totalContainers !== undefined) cart.items[itemIndex].totalContainers = Number(totalContainers);

    await cart.save();

    const updatedCart = await populateCart(Cart.findById(cart._id));

    res.status(200).json({
      success: true,
      message: 'Cart item updated successfully',
      data: updatedCart.items || [],
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

    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      data: updatedCart.items || [],
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
    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      data: [],
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
