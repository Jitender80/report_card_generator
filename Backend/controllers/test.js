const data = {
    items: [
      { disc_index: 0.5, correctAnswersPercentage: 99.5 },
      { disc_index: 0.33, correctAnswersPercentage: 99.67 },
      { disc_index: 0.33, correctAnswersPercentage: 99.67 },
      { disc_index: 0, correctAnswersPercentage: 100 },
      { disc_index: 0, correctAnswersPercentage: 100 },
      { disc_index: 0.33, correctAnswersPercentage: 99.67 },
      { disc_index: 0, correctAnswersPercentage: 100 },
      { disc_index: 0, correctAnswersPercentage: 100 },
      { disc_index: 0, correctAnswersPercentage: 100 },
      { disc_index: 0.33, correctAnswersPercentage: 99.67 },
      { disc_index: 2, correctAnswersPercentage: 98 },
      { disc_index: 0.67, correctAnswersPercentage: 99.33 },
      { disc_index: 1, correctAnswersPercentage: 99 },
      { disc_index: 1, correctAnswersPercentage: 99 },
      { disc_index: 0.67, correctAnswersPercentage: 99.33 },
      { disc_index: 2, correctAnswersPercentage: 98 },
      { disc_index: 0, correctAnswersPercentage: 100 },
      { disc_index: 0, correctAnswersPercentage: 100 },
      { disc_index: 2, correctAnswersPercentage: 98 },
      { disc_index: 0, correctAnswersPercentage: 100 },
      { disc_index: 0, correctAnswersPercentage: 100 },
      { disc_index: 0.5, correctAnswersPercentage: 99.5 },
      { disc_index: 0.33, correctAnswersPercentage: 99.67 },
      { disc_index: -0.5, correctAnswersPercentage: 100.5 },
      { disc_index: 0.5, correctAnswersPercentage: 99.5 },
      { disc_index: 0.33, correctAnswersPercentage: 99.67 },
      { disc_index: 0.67, correctAnswersPercentage: 99.33 },
      { disc_index: 0, correctAnswersPercentage: 100 },
      { disc_index: 0, correctAnswersPercentage: 100 },
      { disc_index: 0.5, correctAnswersPercentage: 99.5 },
      { disc_index: 1, correctAnswersPercentage: 99 },
      { disc_index: 0, correctAnswersPercentage: 100 },
      { disc_index: 0.33, correctAnswersPercentage: 99.67 },
      { disc_index: 0, correctAnswersPercentage: 100 },
      { disc_index: 0, correctAnswersPercentage: 100 },
      { disc_index: 1, correctAnswersPercentage: 99 },
      { disc_index: 0.5, correctAnswersPercentage: 99.5 },
      { disc_index: 0, correctAnswersPercentage: 100 },
      { disc_index: 0.67, correctAnswersPercentage: 99.33 },
      { disc_index: 0.67, correctAnswersPercentage: 99.33 },
      { disc_index: 0.67, correctAnswersPercentage: 99.33 },
      { disc_index: 0.33, correctAnswersPercentage: 99.67 },
      { disc_index: 0, correctAnswersPercentage: 100 },
      { disc_index: 0.67, correctAnswersPercentage: 99.33 },
      { disc_index: -1, correctAnswersPercentage: 101 },
      { disc_index: 0, correctAnswersPercentage: 100 },
      { disc_index: 0.5, correctAnswersPercentage: 99.5 },
      { disc_index: 0.33, correctAnswersPercentage: 99.67 },
      { disc_index: 0, correctAnswersPercentage: 100 },
      { disc_index: 0.33, correctAnswersPercentage: 99.67 },
      { disc_index: 0.67, correctAnswersPercentage: 99.33 },
      { disc_index: 0, correctAnswersPercentage: 100 },
      { disc_index: 0.67, correctAnswersPercentage: 99.33 },
      { disc_index: 0.33, correctAnswersPercentage: 99.67 },
      { disc_index: 0, correctAnswersPercentage: 100 },
      { disc_index: 0, correctAnswersPercentage: 100 },
      { disc_index: 1, correctAnswersPercentage: 99 },
      { disc_index: 1, correctAnswersPercentage: 99 },
      { disc_index: 0, correctAnswersPercentage: 100 },
      { disc_index: 0, correctAnswersPercentage: 100 },
      { disc_index: 0.5, correctAnswersPercentage: 99.5 },
      { disc_index: 0, correctAnswersPercentage: 100 },
      { disc_index: 0, correctAnswersPercentage: 100 },
      { disc_index: 0.5, correctAnswersPercentage: 99.5 },
      { disc_index: 0.67, correctAnswersPercentage: 99.33 },
      { disc_index: 0, correctAnswersPercentage: 100 },
      { disc_index: 0, correctAnswersPercentage: 100 },
      { disc_index: 0, correctAnswersPercentage: 100 },
      { disc_index: 0.67, correctAnswersPercentage: 99.33 },
      { disc_index: 1, correctAnswersPercentage: 99 },
      { disc_index: -1, correctAnswersPercentage: 101 },
      { disc_index: 2, correctAnswersPercentage: 98 },
      { disc_index: 0, correctAnswersPercentage: 100 },
      { disc_index: 0, correctAnswersPercentage: 100 },
      { disc_index: 0.33, correctAnswersPercentage: 99.67 },
      { disc_index: 0, correctAnswersPercentage: 100 },
      { disc_index: 1, correctAnswersPercentage: 99 },
      { disc_index: 0.5, correctAnswersPercentage: 99.5 },
      { disc_index: 0.67, correctAnswersPercentage: 99.33 }
    ]
  };
  
  const categorizedQuestions = {
    "Poor (Bad) Questions": [],
    "Very Difficult Question": [],
    "Difficult Question": [],
    "Good Question": [],
    "Easy Question": [],
    "Very Easy Question": []
  };
  
  data.items.forEach((item, index) => {
    const questionNumber = index + 1;
  
    if (item.disc_index < 0.2 && item.correctAnswersPercentage >= 0) {
      categorizedQuestions["Poor (Bad) Questions"].push({
        questionNumber: questionNumber,
        disc_index: item.disc_index,
        correctAnswersPercentage: item.correctAnswersPercentage
      });
    } else if (item.disc_index >= 0.2 && item.correctAnswersPercentage >= 0 && item.correctAnswersPercentage <= 20.99) {
      categorizedQuestions["Very Difficult Question"].push({
        questionNumber: questionNumber,
        disc_index: item.disc_index,
        correctAnswersPercentage: item.correctAnswersPercentage
      });
    } else if (item.correctAnswersPercentage >= 21 && item.correctAnswersPercentage <= 30.99) {
      categorizedQuestions["Difficult Question"].push({
        questionNumber: questionNumber,
        disc_index: item.disc_index,
        correctAnswersPercentage: item.correctAnswersPercentage
      });
    } else if (item.correctAnswersPercentage >= 31 && item.correctAnswersPercentage <= 70.99) {
      categorizedQuestions["Good Question"].push({
        questionNumber: questionNumber,
        disc_index: item.disc_index,
        correctAnswersPercentage: item.correctAnswersPercentage
      });
    } else if (item.correctAnswersPercentage >= 71 && item.correctAnswersPercentage <= 80.99) {
      categorizedQuestions["Easy Question"].push({
        questionNumber: questionNumber,
        disc_index: item.disc_index,
        correctAnswersPercentage: item.correctAnswersPercentage
      });
    } else if (item.correctAnswersPercentage >= 81 && item.correctAnswersPercentage <= 100) {
      categorizedQuestions["Very Easy Question"].push({
        questionNumber: questionNumber,
        disc_index: item.disc_index,
        correctAnswersPercentage: item.correctAnswersPercentage
      });
    }
  });
  
  console.log(categorizedQuestions);