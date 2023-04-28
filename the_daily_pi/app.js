const form = document.getElementById('issue-form');
const articleText = document.getElementById('article-text');

form.addEventListener('submit', (event) => {
    event.preventDefault(); // prevent form from submitting

    const issueNumber = Number(document.getElementById('issue').value);
    console.log('Issue Number:', issueNumber);
    if (!Number.isInteger(issueNumber) || issueNumber < 0) {
        alert('Issue number must be a whole number');
        return;
    }

    const piUrl = `https://api.pi.delivery/v1/pi?start=${issueNumber}&numberOfDigits=1000`;
    fetch(piUrl)
        .then(response => response.json())
        .then(data => {
            const pairs = data.content.match(/.{1,2}/g);
            const letters = pairs.map(pair => {
                const num = Number(pair);
                if (num < 78) {
                    return String.fromCharCode(97 + num % 26);
                } else {
                    return " ";
                }
            });
            console.log(letters); // Output: ["ab", "cd", "ef"]

            articleText.textContent = `${letters.join("")}`;
        })
        .catch(error => console.error(error));
});
