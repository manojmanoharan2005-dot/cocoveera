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
      .populate('products.product')
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
      .populate('orders')
      .populate('products.product');

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
    const { containerNumber, containerType, destination } = req.body;

    if (!containerNumber || !containerType) {
      return res
        .status(400)
        .json({ success: false, message: 'Please provide all required fields' });
    }

    const capacity = containerType === '20FT' ? 18 : 26; // MT

    const container = await Container.create({
      containerNumber,
      containerType,
      capacity,
      destination: destination || null,
      status: 'preparing',
      progressPercentage: 0,
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
    const { status, location, notes, eta } = req.body;

    const validStatuses = ['preparing', 'loaded', 'at_port', 'exported', 'delivered'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid container status' });
    }

    let container = await Container.findById(req.params.id);
    if (!container) {
      return res.status(404).json({ success: false, message: 'Container not found' });
    }

    // Update status
    container.status = status;

    // Update progress based on status
    const progressMap = {
      preparing: 10,
      loaded: 30,
      at_port: 50,
      exported: 75,
      delivered: 100,
    };
    container.progressPercentage = progressMap[status] || 0;

    // Add tracking history
    container.trackingHistory.push({
      status,
      location: location || 'N/A',
      date: new Date(),
      notes: notes || '',
    });

    // Update dates
    if (status === 'loaded') {
      container.departureDate = new Date();
    }
    if (status === 'delivered') {
      container.deliveryDate = new Date();
    }
    if (eta) {
      container.eta = new Date(eta);
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

    const order = await Order.findById(orderId).populate('items.product');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Add order to container
    if (!container.orders.includes(orderId)) {
      container.orders.push(orderId);
    }

    // Update order with container info
    order.container = container._id;
    order.containerCapacity = container.containerType;
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
      status: { $in: ['preparing', 'loaded', 'at_port', 'exported'] },
    });
    const deliveredContainers = await Container.countDocuments({ status: 'delivered' });

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
