//Always use ` and not normal quote ' for template strings

const fs = require('fs');
const superagent = require('superagent');

//Promise 1
const readFilePro = (file) => {
    return new Promise((resolve, reject) => {
        fs.readFile(file, (err, data) => {
            if (err) {
                reject('File not found');
            }
            //if file is found
            resolve(data);
        });
    });
};

//Promise 2
const writeFilePro = (file, data) => {
    return new Promise((resolve, reject) => {
        fs.writeFile(file, data, (err) => {
            if (err) {
                reject('Could not write file');
            }
            //if file is written successfully
            resolve('Success');
        });
    });
};

//Promise method
/*
readFilePro(``)
    .then(data => {
        console.log(`Breed: ${data}`);
        return superagent.get(`https://dog.ceo/api/breed/${data}/images/random`);
    })
    .then(res => {
        console.log(res.body);
        return writeFilePro('dog-img.txt', res.body.message)
        //^this line returns a promise which is then chained using then()
    })
    .then(() => {
        console.log('Random dog image saved to txt file');
    })
    .catch(err => {
        console.log(err.message);
    });
*/

//Async Await method
const getDogPic = async () => {
    try {
        const data = await readFilePro(`${__dirname}/dog.txt`);
        console.log(`Breed: ${data}`);

        const res = await superagent.get(`https://dog.ceo/api/breed/${data}/images/random`);
        console.log(res.body);

        await writeFilePro('dog-img.txt', res.body.message);
        console.log('Random dog image saved to txt file');
    }
    catch (err) {
        console.log(err.message);
        throw err;
    }
    return ('2. Ready!');
};

//^Promise method (continued from above async await code)
/*
console.log('1. Will get dog pic');
getDogPic()
    .then(x => {
        console.log(x);
        console.log('3. Done getting dog pics');
    })
    .catch(err => {
        console.log('Error!');
    });
*/

//Async Await method
(async () => {
    try {
        console.log('1. Will get dog pic');
        const x = await getDogPic();
        console.log(x);
        console.log('3. Done getting dog pics');
    }
    catch (err) {
        console.log('Error!');
    }
})();//() at end means this async fn is being self invoked