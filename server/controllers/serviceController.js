import Service from "../model/Service.js"; // assuming Shop has embedded or referenced services

// ✅ Edit Service

export const getAllServices = async (req, res) => {
  try {
    const services = await Service.find();
    res.status(200).json(services);
  } catch (err) {
    res.status(500).json({ message: "Error fetching services", error: err });
  }
}

export const createService = async (req, res) => {
  try {
    const { name, description, price, duration, category, isActive, barberId } = req.body;
    if (!name || !price || !duration || !category)
      return res.status(400).json({ message: "Name, price, duration, and category are required" });
    const newService = new Service({
      barberId: req.barber._id,
      name,
      description,
      price,
      duration,
      category,
      isActive: isActive ?? true,
      // optional if you have a barber reference
    });
    const savedService = await newService.save();

    res.status(201).json({ message: "Service added successfully", service: savedService });
  } catch (err) {
    console.error("Error creating service", err);
    res.status(500).json({ message: "Server error", error: err });
  }
}

// controllers/service.controller.js
export const updateService = async (req, res) => {
  try {
    const updatedService = await Service.findOneAndUpdate(
      { _id: req.params.id, barberId: req.barber._id },
      req.body,
      { new: true }
    );

    if (!updatedService)
      return res.status(404).json({ message: "Service not found" });

    // ✅ Emit to the correct barber room (shop-${barberId})
    const shopRoom = `shop-${req.barber._id}`;
    // console.log(`🔁 Emitting serviceUpdated to ${shopRoom}`);

    req.io.to(shopRoom).emit("serviceUpdated", {
      type: "serviceUpdated",
      title: "Service Updated",
      message: `${updatedService.name} was updated.`,
      service: updatedService,
      barberId: req.barber._id,
      createdAt: new Date(),
    });

    res.json({
      message: "Service updated successfully",
      service: updatedService,
    });
  } catch (err) {
    console.error("Error updating service:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Toggle Service Status
export const toggleServiceStatus = async (req, res) => {
  try {
    const { serviceId } = req.params;

    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ message: "Service not found" });


    service.isActive = !service.isActive;
    await service.save();

    res.status(200).json({ message: "Service status toggled", service });
  } catch (err) {
    console.error("Toggle Error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// ✅ Delete Service
export const deleteService = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const deleted = await Service.findByIdAndDelete(serviceId);
    if (!deleted) return res.status(404).json({ message: "Service not found" });
    res.status(200).json({ message: "Service deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting service", error: err });
  }
};

// ✅ Get Single Service by ID
export const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findById(id);

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.status(200).json(service);
  } catch (err) {
    console.error("Error fetching service:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
};