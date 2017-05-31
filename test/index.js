var tape = require("tape"),
    questions = require("..");


tape("questions.create", function(assert) {
    var length = 5,
        count = 0,
        generator = questions.create({
            length: length,
            timeLimit: 10,
            generate: function generate( /* index, options */ ) {
                return {};
            }
        });

    for (var i = 0; i < length; i++) {
        count += 1;
        generator.generate(i);
    }

    assert.equals(count, 5);
    assert.equals(generator.length, 5);
    assert.equals(generator.timeLimit, 10);

    assert.end();
});

tape("questions.createQuestion", function(assert) {

    function question() {}

    function description() {}

    function explain() {}

    function a() {}

    function b() {}

    function c() {}

    function a_value() {}

    function b_value() {}

    function c_value() {}

    var multiChoice = questions.createQuestion({
        type: questions.Types.MULTI_CHOICE,
        seed: 1,
        question: question,
        explain: [explain],
        description: description,
        options: [a, b, c],
        answers: 0
    });
    assert.deepEquals(multiChoice, {
        type: questions.Types.MULTI_CHOICE,
        seed: 1,
        question: question,
        explain: [explain],
        description: description,
        checkAllThatApply: false,
        randomSort: false,
        options: [
            [a, 0],
            [b, 1],
            [c, 2]
        ],
        answers: [0]
    });

    var matching = questions.createQuestion({
        type: questions.Types.MATCHING,
        seed: 1,
        question: question,
        explain: [explain],
        description: description,
        options: [
            [a, a_value],
            [b, b_value],
            [c, c_value]
        ]
    });

    assert.deepEquals(matching, {
        type: 'MATCHING',
        question: question,
        description: description,
        explain: [explain],
        seed: 1,
        options: [
            [a, a_value],
            [b, b_value],
            [c, c_value]
        ],
        keys: [
            [b, 1],
            [a, 0],
            [c, 2]
        ],
        values: [
            [a_value, 0],
            [b_value, 1],
            [c_value, 2]
        ]
    });

    var trueFalse = questions.createQuestion({
        type: questions.Types.TRUE_FALSE,
        seed: 1,
        question: question,
        explain: [explain],
        description: description,
        answer: false
    });
    assert.deepEquals(trueFalse, {
        type: questions.Types.TRUE_FALSE,
        question: question,
        explain: [explain],
        description: description,
        answer: false
    });

    function check(value) {
        return value;
    }
    var input = questions.createQuestion({
        type: questions.Types.INPUT,
        seed: 1,
        question: question,
        explain: [explain],
        description: description,
        check: check
    });
    assert.deepEquals(input, {
        type: questions.Types.INPUT,
        question: question,
        explain: [explain],
        description: description,
        check: check
    });

    assert.end();
});