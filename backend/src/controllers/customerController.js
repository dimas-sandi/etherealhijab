const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Submit survey
exports.submitSurvey = async (req, res) => {
  try {
    const { name, age, gender, city, preference, budget, frequency } = req.body;

    if (!name || !age || !gender || !city || !preference || !budget || !frequency) {
      return res.status(400).json({ error: 'All survey fields are required' });
    }

    const survey = await prisma.customerData.create({
      data: {
        name,
        age: parseInt(age),
        gender,
        city,
        preference,
        budget,
        frequency,
      },
    });

    res.status(201).json({ message: 'Survey submitted successfully', data: survey });
  } catch (err) {
    console.error('Error submitting survey:', err);
    res.status(500).json({ error: 'Failed to submit survey' });
  }
};

// Get all surveys (Admin)
exports.getSurveys = async (req, res) => {
  try {
    const surveys = await prisma.customerData.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(surveys);
  } catch (err) {
    console.error('Error fetching surveys:', err);
    res.status(500).json({ error: 'Failed to fetch surveys' });
  }
};

// Get survey charts statistics (Admin)
exports.getSurveyStats = async (req, res) => {
  try {
    const totalCount = await prisma.customerData.count();
    const surveys = await prisma.customerData.findMany();

    // Grouping preferences
    const preferencesMap = {};
    // Grouping budget
    const budgetMap = {};
    // Grouping frequency
    const frequencyMap = {};
    // Grouping age
    const ageGroups = {
      '17-22 tahun': 0,
      '23-28 tahun': 0,
      '29-35 tahun': 0,
      'Lainnya': 0
    };

    surveys.forEach(survey => {
      // Preferences
      preferencesMap[survey.preference] = (preferencesMap[survey.preference] || 0) + 1;

      // Budget
      budgetMap[survey.budget] = (budgetMap[survey.budget] || 0) + 1;

      // Frequency
      frequencyMap[survey.frequency] = (frequencyMap[survey.frequency] || 0) + 1;

      // Age
      if (survey.age >= 17 && survey.age <= 22) {
        ageGroups['17-22 tahun']++;
      } else if (survey.age >= 23 && survey.age <= 28) {
        ageGroups['23-28 tahun']++;
      } else if (survey.age >= 29 && survey.age <= 35) {
        ageGroups['29-35 tahun']++;
      } else {
        ageGroups['Lainnya']++;
      }
    });

    res.json({
      totalCount,
      preferences: Object.keys(preferencesMap).map(key => ({ label: key, value: preferencesMap[key] })),
      budgets: Object.keys(budgetMap).map(key => ({ label: key, value: budgetMap[key] })),
      frequencies: Object.keys(frequencyMap).map(key => ({ label: key, value: frequencyMap[key] })),
      ages: Object.keys(ageGroups).map(key => ({ label: key, value: ageGroups[key] }))
    });
  } catch (err) {
    console.error('Error calculating survey stats:', err);
    res.status(500).json({ error: 'Failed to calculate statistics' });
  }
};
