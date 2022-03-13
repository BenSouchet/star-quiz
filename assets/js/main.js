const API_URL = "https://rawcdn.githack.com/akabab/starwars-api/0.2.1/api/all.json";
const CORS_BYPASS_PROXY = "https://api.allorigins.win/get?url=";
const FALLBACK_IMG_URL = "https://starwars.fandom.com/api.php";
const NB_LIVES = 3;

let QUIZ_SCORE;
let QUIZ_LIVES;
let QUIZ_CHARACTER_IMG;
let QUIZ_SUBTITLE;
let QUIZ_QUESTION;
let QUIZ_PROP1;
let QUIZ_PROP2;
let QUIZ_MAIN_ACTION;

let CURR_SCORE;
let CURR_LIVES;
let CURR_QUESTION;


function httpGet(theUrl) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false );// false for synchronous request
    xmlHttp.send( null );
    return xmlHttp.responseText;
}

function contructDatabase(json, questions) {
    const relevant_keys = Object.keys(questions);
    const characters = JSON.parse(json);
    database = {
        'characters': [], 'answers': {}
    };
    // Prepare the "answers" object
    database.answers = Object.fromEntries(relevant_keys.map(key => [key, []]));

    for (const character of characters) {
        let new_character = { 'name': character.name, 'image': character.image, 'properties': {} };
        for (const key of relevant_keys) {
            if (key in character) {
                let answer = character[key];
                if (!answer) {
                    // Some properties are empty skip them
                    continue;
                }
                if (Array.isArray(answer)) {
                    for (const element of answer) {
                        if (!database.answers[key].includes(element)) {
                            database.answers[key].push(element);
                        }
                    }
                } else {
                    answer = answer.toString();
                    if (!database.answers[key].includes(answer)) {
                        database.answers[key].push(answer);
                    }
                }
                new_character.properties[key] = answer;
            }
        }
        // Add character to database array
        database.characters.push(new_character);
    }

    return database;
}

const QUESTIONS = {
    'species': ["From which species is this character?"],
    'eyeColor': ["What is the color of this character's eyes?", "This character have $ eyes?"],
    'height': ["How tall is this character?", "Is this character $m tall?"],
    'homeworld': ["Where does this character come from?", "Does this character come from $?"],
    'bornLocation': ["Where was this character born?", "Was this character born in $?"],
    'diedLocation': ["Where did this character die?", "Did this character die in $?"],
    'affiliations': ["Is this character a member of the $?"],
    'apprentices': ["Which one was an apprentice of this character?", "Was $ an apprentice of this character?"],
    'masters': ["Which one was a master of this character?", "Was $ one of the masters of this character?"],
    'creator': ["Who created this character?", "Did $ create this character?"],
    'sensorColor': ["What is the color of its sensor", "Is its sensor $?"],
    'manufacturer': ["Who is the manufacturer?", "Is its manufacturer $?"]
};

const json_str = httpGet(API_URL);

const DATABASE = contructDatabase(json_str, QUESTIONS);

function isObject(obj) {
    return obj === Object(obj);
  }

function randomIndex(length) {
    return Math.floor(Math.random() * length);
}

function randomElement(data) {
    if (data) {
        let array = [];
        if (Array.isArray(data)) {
            array = data;
        } else if (isObject(data)) {
            array = Object.keys(data);
        } else {
            return null;
        }
        return array[randomIndex(array.length)];
    }
    return null;
}

function _getAnswers(database, character, topic) {
    const topic_data = character.properties[topic];

    if (typeof topic_data === "string") {
        const wrong_answer = randomElement(database.answers[topic].filter(n => n != topic_data));
        return [topic_data, wrong_answer];
    }
    const right_answer = randomElement(topic_data);
    const wrong_answer = randomElement(database.answers[topic].filter(n => !topic_data.includes(n)));

    return [right_answer, wrong_answer];
}

function CreateQuestion(database, character_index) {
    let question = { 'title': "", 'proposition1': "", 'proposition2': "", 'answer': "" };
    const character = database.characters[character_index];

    // Get Topic
    const topic = randomElement(character.properties);

    // Get question title
    const question_title = randomElement(QUESTIONS[topic]);


    // Get answers
    const [right_answer, wrong_answer] = _getAnswers(database, character, topic);

    coin_flip = Math.round(Math.random());
    // Check question type
    if (question_title.indexOf('$') > -1) {
        // It's a True/False question
        // The coin_flip determine the answer
        if (coin_flip) {
            question.title = question_title.replace('$', right_answer);
            question.answer = "TRUE";
        } else {
            question.title = question_title.replace('$', wrong_answer);
            question.answer = "FALSE";
        }
        
        question.proposition1 = "TRUE";
        question.proposition2 = "FALSE";
    } else {
        // It's a double propositions question
        question.title = question_title;
        // The coin_flip determine where we put right answer
        if (coin_flip) {
            question.proposition1 = wrong_answer;
            question.proposition2 = right_answer;
        } else {
            question.proposition1 = right_answer;
            question.proposition2 = wrong_answer;
        }
        question.answer = right_answer;
    }
    return question;
}

function _updateScoreAndLives() {
    QUIZ_SCORE.innerText = '' + CURR_SCORE;
    QUIZ_LIVES.innerText = 'I'.repeat(CURR_LIVES);
}

function _callbackMainAction() {
    if (CURR_LIVES === 0) {
        startNewGame();
    } else {
        newQuestion();
    }
}

function _callbackAnswered(event) {
    // Disable propositions
    QUIZ_PROP1.classList.add('disabled');
    QUIZ_PROP2.classList.add('disabled');

    const right_answer = (event.currentTarget.innerText === CURR_QUESTION.answer);

    // Is it a right answer ?
    if (right_answer) {
        // Set classes for result
        event.currentTarget.classList.add('right-answer');

        // Increment score
        CURR_SCORE += 1;
    } else {
        // Set classes for result
        event.currentTarget.classList.add('wrong-anwser');

        // Decrement lives
        CURR_LIVES -= 1;
        // Check if game ende
        if (CURR_LIVES <= 0) {
            // Change main action innerText
            QUIZ_MAIN_ACTION.innerText = "START NEW GAME";
        }
    }
    // Update Score and lives in the interface (DOM)
    _updateScoreAndLives();

    // Enable main action
    QUIZ_MAIN_ACTION.classList.remove('disabled');  
}

function _fallbackgetImageURL(character_serialized_name) {
    const action = 'parse';
    const format = 'json';
    const prop = 'properties';
    let params = {
        'action': action,
        'format': format,
        'prop': prop,
        'page': character_serialized_name,
        'formatversion': '2',
        'redirects':''
    };

    const url = CORS_BYPASS_PROXY + encodeURIComponent(FALLBACK_IMG_URL + '?' + (new URLSearchParams(params)).toString());

    const result = httpGet(url);

    const json_response = JSON.parse(result);
    const json_contents = JSON.parse(json_response.contents);
    const json_infoboxes = JSON.parse(json_contents.parse.properties.infoboxes);
    if (json_infoboxes.length > 0 && json_infoboxes[0].data.length > 0) {
        for (element of json_infoboxes[0].data) {
            if (element.type === "image") {
                if (element.data.length > 0) {
                    const image_url = element.data[0].url;
                    if (image_url.indexOf('.png/') > -1) {
                        return image_url.substring(0, image_url.indexOf('.png/') + 5);
                    } else if (image_url.indexOf('.jpg/') > -1) {
                        return image_url.substring(0, image_url.indexOf('.jpg/') + 5);
                    } else if (image_url.indexOf('.jpeg/') > -1) {
                        return image_url.substring(0, image_url.indexOf('.jpeg/') + 6);
                    } else if (image_url.indexOf('.PNG/') > -1) {
                        return image_url.substring(0, image_url.indexOf('.PNG/') + 5);
                    } else if (image_url.indexOf('.jpg/') > -1) {
                        return image_url.substring(0, image_url.indexOf('.JPG/') + 5);
                    } else if (image_url.indexOf('.JPEG/') > -1) {
                        return image_url.substring(0, image_url.indexOf('.JPEG/') + 6);
                    }
                }
                break;
            }
        }
    }
    return null;
}

function _getimageURL(character) {
    let image_url = character.image;
    let request = new XMLHttpRequest();
    request.open('HEAD', image_url, false);
    request.send();
    if (request.status != 200) {
        // Image doesn't exists anymore scrap img from Star Wars Fandom
        const fallback_url = _fallbackgetImageURL(character.name.replace(/\s+/g, "_"));
        if (fallback_url !== null) {
            return fallback_url;
        }
    }
    return image_url;
}

function _setNewQuestion() {
    const random_character_index = randomIndex(DATABASE.characters.length);
    CURR_QUESTION = CreateQuestion(DATABASE, random_character_index);
    const character = DATABASE.characters[random_character_index];
    
    // Set front info (DOM)
    QUIZ_CHARACTER_IMG.src = _getimageURL(character);
    QUIZ_SUBTITLE.innerText = character.name;
    QUIZ_QUESTION.innerText = CURR_QUESTION.title;
    QUIZ_PROP1.innerText = CURR_QUESTION.proposition1;
    QUIZ_PROP2.innerText = CURR_QUESTION.proposition2;

    // Re-enable propositions
    QUIZ_PROP1.classList.remove('disabled');
    QUIZ_PROP2.classList.remove('disabled');
}

function newQuestion() {
    // Remove previous result classes
    QUIZ_PROP1.classList.remove('right-answer', 'wrong-anwser');
    QUIZ_PROP2.classList.remove('right-answer', 'wrong-anwser');

    // Disable main action
    QUIZ_MAIN_ACTION.innerText = "NEXT QUESTION";
    QUIZ_MAIN_ACTION.classList.add('disabled');

    // Set new question
    _setNewQuestion();
}

function startNewGame() {
    // Update score et lives counts
    CURR_SCORE = 0;
    CURR_LIVES = NB_LIVES;
    _updateScoreAndLives();
    
    newQuestion();
}

function initWebsite() {
    // Retrieve DOM objects
    QUIZ_SCORE = document.getElementById('quiz-score');
    QUIZ_LIVES = document.getElementById('quiz-lives');
    QUIZ_CHARACTER_IMG = document.getElementById('quiz-character-image');
    QUIZ_SUBTITLE = document.getElementById('quiz-subtitle');
    QUIZ_QUESTION = document.getElementById('quiz-question');
    QUIZ_PROP1 = document.getElementById('quiz-proposition1');
    QUIZ_PROP2 = document.getElementById('quiz-proposition2');
    QUIZ_MAIN_ACTION = document.getElementById('main-action');

    // Add listeners
    QUIZ_PROP1.addEventListener('click', function (evt) {
        _callbackAnswered(evt);
    });
    QUIZ_PROP2.addEventListener('click', function (evt) {
        _callbackAnswered(evt);
    });
    QUIZ_MAIN_ACTION.addEventListener('click', function (evt) {
        _callbackMainAction();
    });
    
    // Start first game
    startNewGame();
}

if (document.readyState !== 'loading') {
    initWebsite();
} else {
    document.addEventListener("DOMContentLoaded", function (event) {
        initWebsite();
    });
}