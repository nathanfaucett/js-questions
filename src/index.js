var has = require("@nathanfaucett/has"),
    extend = require("@nathanfaucett/extend"),
    arrayForEach = require("@nathanfaucett/array-for_each"),
    arrayMap = require("@nathanfaucett/array-map"),
    isArray = require("@nathanfaucett/is_array"),
    isNumber = require("@nathanfaucett/is_number"),
    isBoolean = require("@nathanfaucett/is_boolean"),
    isUndefined = require("@nathanfaucett/is_undefined"),
    PseudoRandom = require("@nathanfaucett/pseudo_random"),
    isFunction = require("@nathanfaucett/is_function");


var questions = exports,
    Types = {
        MULTI_CHOICE: "MULTI_CHOICE",
        MATCHING: "MATCHING",
        TRUE_FALSE: "TRUE_FALSE",
        INPUT: "INPUT"
    };


function create(options) {
    var questions = {},
        index, seed, length, timeLimit, difficulty, generate;

    options = options || {};

    if (has(options, "length") && (!isNumber(options.length) || options.length === 0)) {
        throw new Error("create(options) options.length must be number and cant be zero, got " + options.length);
    }
    if (!isFunction(options.generate)) {
        throw new Error("create(options) options.generate is invalid function, got " + options.check);
    }

    index = 0;
    seed = options.seed || 1;
    length = options.length || -1;
    timeLimit = options.timeLimit || -1;
    difficulty = options.difficulty || 1;
    generate = options.generate;

    questions.seed = seed;
    questions.length = length;
    questions.timeLimit = timeLimit;
    questions.difficulty = difficulty;
    questions.generate = function(index, opts, callback) {
        if (length < 0 || index < length) {
            return generate(index, extend({}, options, opts), callback);
        } else {
            throw new Error("generate(index, options) trying to generate question out side of questions range");
        }
    };

    return questions;
}

function createQuestion(options) {
    var value = {};

    options = options || {};

    value.type = validType(options.type);
    value.question = validFunction(options.question, "question");
    value.description = validFunction(options.description, "description");
    value.explain = validExplain(options.explain);

    switch (value.type) {
        case Types.MULTI_CHOICE:
            value.seed = validNumber(options.seed, "seed");
            value.randomSort = isUndefined(options.randomSort) ?
                false :
                validBoolean(options.randomSort, "randomSort");
            value.options = validOptions(options.options, value.randomSort, value.seed);
            value.answers = validAnswers(
                isUndefined(options.answers) ? options.answer : options.answers,
                value.options
            );
            value.checkAllThatApply = !!options.checkAllThatApply;
            break;
        case Types.MATCHING:
            value.seed = validNumber(options.seed, "seed");
            value.options = validMatchingOptions(options.options);
            getKeysValues(value, value.options, value.seed);
            break;
        case Types.TRUE_FALSE:
            value.answer = validBoolean(options.answer, "answer");
            break;
        case Types.INPUT:
            if (options.inputType) {
                value.inputType = options.inputType;
            }
            value.check = validFunction(options.check, "check");
            break;
    }

    return value;
}

function getKeysValues(value, options, seed) {
    var rng = new PseudoRandom(seed);

    rng.nextInt();

    value.keys = arrayMap(options, function each(option, index) {
        return [option[0], index];
    });
    value.values = arrayMap(options, function each(option, index) {
        return [option[1], index];
    });

    sortArray(value.keys, rng);
    sortArray(value.values, rng);
}

function validExplain(explain) {
    if (!isArray(explain)) {
        throw new Error("createQuestion(options) options.explain must be an array");
    }

    arrayForEach(explain, function each(step, index) {
        validFunction(step, "explain[" + index + "]");
    });

    return explain;
}

function validType(type) {
    if (!Types[type]) {
        throw new Error("createQuestion(options) options.type is invalid enum, got " + type);
    } else {
        return type;
    }
}

function validNumber(value, string) {
    if (!isNumber(value)) {
        throw new Error("createQuestion(options) options." + string + " is invalid number, got " + value);
    } else {
        return value;
    }
}

function validFunction(func, string) {
    if (!isFunction(func)) {
        throw new Error("createQuestion(options) options." + string + " is invalid function, got " + func);
    } else {
        return func;
    }
}

function sortArray(array, rng) {
    array.sort(function sortFn() {
        var value = rng.nextFloat();

        if (value < 0.334) {
            return -1;
        } else if (value < 0.667) {
            return 0;
        } else {
            return 1;
        }
    });
}

function validOptions(options, randomSort, seed) {
    if (!isArray(options) || options.length === 0) {
        throw new Error("createQuestion(options) options.options can not be empty");
    }

    options = arrayMap(options, function each(option, index) {
        validFunction(option, "options[" + index + "]");
        return [option, index];
    });

    if (randomSort) {
        sortArray(options, new PseudoRandom(seed));
    }

    return options;
}

function validAnswers(answers, options) {
    var length = options.length;

    if ((isArray(answers) && answers.length === 0) || (!isArray(answers) && !isNumber(answers))) {
        throw new Error("createQuestion(options) options.answers can not be empty");
    }

    if (isNumber(answers)) {
        answers = [answers];
    }

    arrayForEach(answers, function each(index) {
        validIndex(index, length);
    });

    return answers;
}

function validIndex(index, length) {
    if (index < 0 || index >= length) {
        throw new Error("createQuestion(options) options.answer(s) is invalid needs to be 0 - " + length);
    } else {
        return index;
    }
}


function validMatchingOptions(options) {
    if ((isArray(options) && options.length === 0) || (!isArray(options) && !isNumber(options))) {
        throw new Error("createQuestion(options) options.options can not be empty");
    }

    arrayForEach(options, function each(option, index) {
        if (!isArray(option)) {
            throw new Error("createQuestion(options) options.options is invalid array of arrays, got " + options);
        }

        validFunction(option[0], "options[" + index + "] key");
        validFunction(option[1], "options[" + index + "] value");
    });

    return options;
}

function validBoolean(value, string) {
    if (isBoolean(value)) {
        return value;
    } else {
        throw new Error("createQuestion(options) options." + string + " is invalid boolean, got " + value);
    }
}


questions.Types = Types;
questions.create = create;
questions.createQuestion = createQuestion;
