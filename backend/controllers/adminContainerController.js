/**
 * File: backend/controllers/adminContainerController.js
 * Purpose: Handles the business logic and request processing for adminContainer operations.
 */
import Container from '../models/Container.js';
import Order from '../models/Order.js';

// @desc    Get all containers (Admin)
// @route   GET /api/admin/containers
// @access  Private/Admin
export const getAdminContainers = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (status) query.status = status;
    if (search) {
      query.containerNumber = { $regex: search, $options: 'i' };
    }

    const total = await Container.countDocuments(query);
    const containers = await Container.find(query)
      .populate('orders')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: containers,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single container
// @route   GET /api/admin/containers/:id
// @access  Private/Admin
export const getAdminContainer = async (req, res) => {
  try {
    const container = await Container.findById(req.params.id)
      .populate('orders');

    if (!container) {
      return res.status(404).json({ success: false, message: 'Container not found' });
    }

    res.status(200).json({ success: true, data: container });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create container (Admin)
// @route   POST /api/admin/containers
// @access  Private/Admin
export const createAdminContainer = async (req, res) => {
  try {
    const { containerNumber, containerType, maxWeight, maxVolume } = req.body;

    if (!containerNumber || !containerType || !maxWeight || !maxVolume) {
      return res
        .status(400)
        .json({ success: false, message: 'Please provide all required fields' });
    }

    const container = await Container.create({
      containerNumber,
      containerType,
      maxWeight,
      maxVolume,
      currentWeight: 0,
      currentVolume: 0,
      remainingWeight: maxWeight,
      remainingVolume: maxVolume,
      utilizationPercentage: 0,
      status: 'Available',
    });

    res.status(201).json({ success: true, data: container });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update container status (Admin)
// @route   PATCH /api/admin/containers/:id/status
// @access  Private/Admin
export const updateContainerStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ['Available', 'Loading', 'Ready For Shipment', 'In Transit', 'Delivered', 'Archived'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid container status' });
    }

    let container = await Container.findById(req.params.id);
    if (!container) {
      return res.status(404).json({ success: false, message: 'Container not found' });
    }

    // Update status
    container.status = status;

    // Optional: Sync status with all assigned orders
    if (container.orders && container.orders.length > 0) {
      await Order.updateMany(
        { _id: { $in: container.orders } },
        { $set: { containerStatus: status } }
      );
    }

    await container.save();

    res.status(200).json({
      success: true,
      message: 'Container status updated successfully',
      data: container,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Assign order to container
// @route   PATCH /api/admin/containers/:id/assign-order
// @access  Private/Admin
export const assignOrderToContainer = async (req, res) => {
  try {
    const { orderId } = req.body;

    let container = await Container.findById(req.params.id);
    if (!container) {
      return res.status(404).json({ success: false, message: 'Container not found' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Add order to container
    if (!container.orders.includes(orderId)) {
      container.orders.push(orderId);
    }

    // Update order with container info
    order.assignedContainer = container._id;
    order.containerStatus = container.status;
    await order.save();

    await container.save();

    res.status(200).json({
      success: true,
      message: 'Order assigned to container successfully',
      data: container,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get container statistics
// @route   GET /api/admin/containers/stats
// @access  Private/Admin
export const getContainerStats = async (req, res) => {
  try {
    const totalContainers = await Container.countDocuments();
    const activeContainers = await Container.countDocuments({
      status: { $in: ['Loading', 'Ready For Shipment', 'In Transit'] },
    });
    const deliveredContainers = await Container.countDocuments({ status: 'Delivered' });

    const statusBreakdown = await Container.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalContainers,
        activeContainers,
        deliveredContainers,
        statusBreakdown,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update container destination and ETA
// @route   PATCH /api/admin/containers/:id/logistics
// @access  Private/Admin
export const updateContainerLogistics = async (req, res) => {
  try {
    const { destination, eta } = req.body;

    let container = await Container.findById(req.params.id);
    if (!container) {
      return res.status(404).json({ success: false, message: 'Container not found' });
    }

    if (destination) container.destination = destination;
    if (eta) container.eta = new Date(eta);

    await container.save();

    res.status(200).json({
      success: true,
      message: 'Container logistics updated successfully',
      data: container,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update container loaded products
// @route   PATCH /api/admin/containers/:id/products
// @access  Private/Admin
export const updateContainerProducts = async (req, res) => {
  try {
    const { loadedProducts } = req.body; // Array of objects

    let container = await Container.findById(req.params.id);
    if (!container) {
      return res.status(404).json({ success: false, message: 'Container not found' });
    }

    container.loadedProducts = loadedProducts || [];

    // Recalculate totals
    let totalWeight = 0;
    let totalVolume = 0;

    container.loadedProducts.forEach((product) => {
      totalWeight += Number(product.actualWeight) || 0;
      totalVolume += Number(product.actualVolume) || 0;
    });

    container.currentWeight = totalWeight;
    container.currentVolume = totalVolume;

    container.remainingWeight = Math.max(0, container.maxWeight - totalWeight);
    container.remainingVolume = Math.max(0, container.maxVolume - totalVolume);

    const weightUtil = (totalWeight / container.maxWeight) * 100;
    const volUtil = (totalVolume / container.maxVolume) * 100;
    
    // Utilization is the max of the two
    container.utilizationPercentage = Math.min(100, Math.max(weightUtil, volUtil));

    await container.save();

    res.status(200).json({
      success: true,
      message: 'Container products updated successfully',
      data: container,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
