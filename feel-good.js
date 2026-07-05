document.addEventListener('DOMContentLoaded', function() {
    const feelGoodLinks = [
        'https://www.goodnewsnetwork.org/',
        'https://thehappynewspaper.com/?v=0b3b97fa6688',
        'https://puginarug.com/',
        'https://purrli.com/',
        'https://make-everything-ok.com/',
        'https://thenicestplace.net/'
    ];

    const button = document.getElementById('randomButton');
    const statusDisplay = document.getElementById('statusDisplay');

    button.addEventListener('click', function() {
        const randomIndex = Math.floor(Math.random() * feelGoodLinks.length);
        const chosenUrl = feelGoodLinks[randomIndex];

        statusDisplay.textContent = 'Tuning in: ' + chosenUrl;

        window.open(chosenUrl, '_blank', 'noopener,noreferrer');
    });
});
