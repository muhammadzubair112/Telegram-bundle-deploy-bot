
const randomName = (length) => {
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    let randomString = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * letters.length);
        randomString += letters[randomIndex];
    }

    return randomString.toUpperCase();
}

module.exports = randomName