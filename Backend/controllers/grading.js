const Class = require("../models/excelmodel");



exports.getGrades = async (req, res) => {
try{
    const classData = await Class.findOne().populate('students').sort({ createdAt: -1 }).limit(1);

    console.log(
        "🚀 ~ exports.getResultData= ~ lassData:",
        classData.students
      );
      const gradeBoundaries = {
        APlus: { min: 90, max: 100 },
        A: { min: 80, max: 89 },
        BPlus: { min: 75, max: 79 },
        B: { min: 70, max: 74 },
        CPlus: { min: 65, max: 69 },
        C: { min: 60, max: 64 },
        DPlus: { min: 55, max: 59 },
        D: { min: 50, max: 54 },
        F: { min: 0, max: 49 }
      };
      
  
      // Initialize counters for each grade category
      const gradeCounts = {
        APlus: 0,
        A: 0,
        BPlus: 0,
        B: 0,
        CPlus: 0,
        C: 0,
        DPlus: 0,
        D: 0,
        F: 0
      };
  

  
  
    // return res.json({ data: classData.students });
  
    const totalStudents = 0
  
        classData.students.forEach(student => {
        const percentage = student.percentage;
        console.log("🚀 ~ exports.getResultData= ~ percentage:", percentage)
        for (const [grade, boundary] of Object.entries(gradeBoundaries)) {
          if (percentage >= boundary.min && percentage <= boundary.max) {
            gradeCounts[grade]++;
            totalStudents++;
            break;
          }
        }
      });

      // Calculate total number of students

    // Calculate percentages for each grade
    const gradePercentages = {};
    for (const [grade, count] of Object.entries(gradeCounts)) {
      gradePercentages[grade] = (count / totalStudents) * 100;
    }

    // Prepare FinalGrade object
    const finalGrade = {};
    for (const grade of Object.keys(gradeCounts)) {
      finalGrade[grade] = {
        number: gradeCounts[grade],
        percentage: gradePercentages[grade]
      };
    }
 


    // Update the Class document with FinalGrade
    classData.FinalGrade = finalGrade;
    await classData.save();


      return res.status(200).json({data: gradeCounts, message: "Data fetched successfully"});
}catch(err){
    console.log(err);
    return res.status(500).json({message: "Internal server error"});
}
}