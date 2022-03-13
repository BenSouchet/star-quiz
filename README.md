# Star Quiz

![cover_star_quiz](https://user-images.githubusercontent.com/17025808/158056883-2e9fb605-18d5-4970-ad2b-8fa9d4d89c50.png)

Website here >> https://bensouchet.github.io/star-quiz/ <<

***Test your knowledge on the characters of the Star Wars franchise.***

## Description

Quiz on the characters of Star Wars using [this API](https://github.com/akabab/starwars-api) to retrieve info, the project has been done for fun, I wanted to test the creation of a quiz since it' a very popular kind of game we find on internet.

The project (website, quiz JavaScript code) was developed in few hours, so there may be bugs.

## Source Code

You can fin the source code of the whole project in [the `gh-pages` branch](https://github.com/BenSouchet/star-quiz/tree/gh-pages).  
The project use Github Pages (Jekyll) to created a website.  
The JS code is [located here](https://github.com/BenSouchet/star-quiz/blob/gh-pages/assets/js/main.js), if you are interested to build your own quiz game please see the disclaimer section below.

## Disclaimer

Small project done for fun, I know that users can cheat with breakpoints in the JS file.  
The code do the strict minimum, without trying to be optimized or protected against cheating.

If you want to create a `TRUE` quiz in JS you need to do some tasks:
 - All database related function need to move on a backend server.
 - All functions related to creating the question also move to backend server.
 - The `CreateQuestion()` function call need to be an API call returning a `QuizQuestion` object containing `character_id`, `title`, `proposition1`, `proposition2`. This API call need to return a null object if the remaining_lives is zero (avoid player cheating).
 - To retrieve the character image and name do a second API call with the `character_id` returning a `QuizCharacter` object with inside `image_url` & `name`.
 - The `_callbackAnswered()` function need to do a API call to retrieve a `QuizUpdate`, inside you need to have the `was_answer_correct`, `curr_score`, `remaining_lives`. With these info update the DOM.

With theses modifications the **score**, **lives remaining**, **database** and **question creation** are all on the server. Users will no longer be able to cheat since the answer is never store on the browser.

## Additional Information

Some images were not available (error 404) so I had to use a second API, this isn't a true public API so I had trouble with CORS (Cross-origin resource sharing), this is why in the code I also needed the use of [allOrigins](https://github.com/gnuns/allOrigins), a Github project (from the user [Gnuns](https://github.com/gnuns)) to bypass CORS and be able to get fallback images.  
This is kind of `hacky` but I haven't found a proper way to find and retrieve images of **Star Wars** characters 🙁.

## Others Ressouces & Useful links

 - [akabab/starwars-api](https://github.com/akabab/starwars-api), the API I used to create the quiz, all the questions has been generated with character data from this API. 
 - [Star Wars Wiki](https://starwars.fandom.com/wiki/Main_Page), second API used for character pictures, only when picture url from the first api was not available.
 - [gnuns/allOrigins](https://github.com/gnuns/allOrigins), a Github project to avoid Same-origin policy problems when getting data from others websites.
 
## Licenses

The **code** present in this repository is under [MIT license](https://github.com/BenSouchet/star-quiz/blob/main/LICENSE).

The **pictures** of Star Wars characters are copyrighted and are property of their respective owners,  you cannot use them for commercial purposes.

The **logo** and **icons** are under [(CC BY-NC-ND 4.0)](https://creativecommons.org/licenses/by-nc-nd/4.0/), you cannot edit theses files, you cannot use them for commercial purposes & you must give appropriate credit *(© Star Quiz, Ben Souchet)*.