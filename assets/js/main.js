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

const json_str = httpGet("https://rawcdn.githack.com/akabab/starwars-api/0.2.1/api/all.json");

database = contructDatabase(json_str, QUESTIONS);

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
    console.log('Character Index : ' + character_index + '. Character Name : ' + character.name);

    // Get Topic
    const topic = randomElement(character.properties);
    console.log('topic: ' + topic);

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