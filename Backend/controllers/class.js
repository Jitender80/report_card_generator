

exports.createClass = async (req, res) => {

    const { name, section, tutor, year, session } = req.body;

    try {
      const newClass = await prisma.class.create({
        data: {
          name,
          section,
          tutor,
          year,
          session,
        },
      });
      res.status(201).json(newClass);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create class' });
    }
  }