function evaluate(actualOutput, expectedOutput) {
    const actual = actualOutput.trim();
    const expected = expectedOutput.trim();
    
    return actual === expected;
}

module.exports = {
    evaluate
};
