// Endpoint to generate categoryId
exports.generateCategoryId = (req, res) => {
  // Find the highest categoryId and increment
  const Category = require('../models/Category');
  Category.find({}, 'categoryId')
    .sort({ categoryId: -1 })
    .limit(1)
    .then(categories => {
      let nextNumber = 1;
      if (categories.length > 0) {
        // Extract number from CATxxx
        const lastId = categories[0].categoryId;
        const match = lastId.match(/CAT(\d+)/);
        if (match) {
          nextNumber = parseInt(match[1], 10) + 1;
        }
      }
      // Pad with leading zeros to 3 digits
      const categoryId = `CAT${nextNumber.toString().padStart(3, '0')}`;
      res.json({ categoryId });
    })
    .catch(err => {
      res.status(500).json({ error: 'Failed to generate categoryId' });
    });
};
const Category = require('../models/Category');

exports.createCategory = async (req, res) => {
  try {
    const categoryData = { ...req.body };
    // Use categoryId as the _id
    categoryData._id = categoryData.categoryId;
    const category = new Category(categoryData);
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ error: 'Not found' });
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCategoryById = async (req, res) => {
  try {
    const categoryData = { ...req.body };
    // Use categoryId as the _id if provided
    if (categoryData.categoryId) {
      categoryData._id = categoryData.categoryId;
    }
    const category = await Category.findByIdAndUpdate(req.params.id, categoryData, { new: true });
    if (!category) return res.status(404).json({ error: 'Not found' });
    res.json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteCategoryById = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
