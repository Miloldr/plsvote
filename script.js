document.addEventListener('DOMContentLoaded', () => {
    const titleContainer = document.getElementById('title-container');
    const ratingContainer = document.getElementById('rating-container');
    const messageDiv = document.getElementById('message');
    let startTime;
    let currentTitles;
    let selectedRating = 0;
    let userId = localStorage.getItem("userId");
    let chosenTitle = "";
    const goals = {
        10: {
            type: "background",
            image: "bg.png",
        },
        // 50: { type: "cookie", image: "https://w7.pngwing.com/pngs/964/816/png-transparent-chocolate-chip-cookie-fortune-cookie-biscuits-cookie-clicker-cookies-cartoon-food-baking-cooking-thumbnail.png" },
    };

    if (!userId) {
        userId = generateUserId();
        localStorage.setItem('userId', userId);
    }

    function generateUserId() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    function fetchTitles() {
        fetch('https://5295-78-57-126-227.ngrok-free.app/get_titles', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user_id: userId }),
        })
            .then(response => response.json())
            .then((data) => {
                if (data.message === 'super_thanks') {
                    messageDiv.textContent =
                        'Ačiū už dalyvavimą, jūs išbandėte visas įmanomas kombinacijas';
                    hideElement(ratingContainer);
                    hideElement(titleContainer);
                } else {
                    currentTitles = data.titles;
                    titleContainer.innerHTML = '';
                    currentTitles.forEach((title) => {
                        const button = document.createElement('button');
                        button.textContent = title;
                        button.classList.add('title-button');
                        button.addEventListener('click', () => submitChoice(title));
                        titleContainer.appendChild(button);
                    });
                    showElement(titleContainer);
                    hideElement(ratingContainer);
                    startTime = new Date().getTime();

                    combinationsRated = data.combinations_rated;
                    updateCounterDisplay();
                }
            })
            .catch((error) => console.error('Error fetching titles:', error));
    }

    function submitChoice(choice) {
        chosenTitle = choice;
        const endTime = new Date().getTime();
        const timeTaken = (endTime - startTime) / 1000;
        if (timeTaken < 1) {
            messageDiv.textContent = "Prašome vertinti sąžiningai ir neskubėti!";
            showElement(messageDiv);
            hideElement(titleContainer);
            setTimeout(() => {
                hideElement(messageDiv);
                fetchTitles();
            }, 1000);
        } else {
            hideElement(titleContainer);
            setTimeout(() => {
                showRating();
            }, 500);
        }
    }

    function showRating() {
        messageDiv.innerHTML = `Įvertinkite pasirinktą pavadinimą: <span id="chosen-title">${chosenTitle}</span>`;
        showElement(messageDiv);
        createStars();
        showElement(ratingContainer);
    }

    function checkGoals(combinationsRated) {
        for (const [goalCount, reward] of Object.entries(goals)) {
            if (combinationsRated >= parseInt(goalCount)) {
                if (reward.type === "background") {
                    document.body.style.backgroundImage = `url('${reward.image}')`;
                } else if (reward.type === "cookie") {
                    const cookieReward = document.getElementById("cookie-reward");
                    cookieReward.src = reward.image;
                    cookieReward.classList.add('fade-in-image');
                    cookieReward.style.display = "block";
                    setTimeout(() => {
                        cookieReward.classList.remove('fade-in-image');
                    }, 1000);
                }
            }
        }
    }

    function getCombinationWord(count) {
        if (count < 10 || count > 20) {
            return "kombinacijas";
        } else {
            return "kombinacijų";
        }
    }

    function updateCounterDisplay() {
        const counterSpan = document.getElementById('combination-counter');
        const combinationWord = getCombinationWord(combinationsRated);
        counterSpan.textContent = `${combinationsRated} ${combinationWord}`;
    }

    function sendChoice(choice, timeTaken, rating) {
        fetch('https://5295-78-57-126-227.ngrok-free.app/submit_choice', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                choice: choice,
                time_taken: timeTaken,
                rating: rating,
                user_id: userId,
                titles: currentTitles,
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.message === 'super_thanks') {
                    messageDiv.textContent =
                        'Ačiū už dalyvavimą, jūs išbandėte visas įmanomas kombinacijas';
                    hideElement(ratingContainer);
                    hideElement(titleContainer);
                } else {
                    messageDiv.textContent = 'Ačiū už atsiliepimą!';
                    showElement(messageDiv);
                    hideElement(ratingContainer);
                    checkGoals(data.combinations_rated);
                    setTimeout(() => {
                        hideElement(messageDiv);
                    }, 500);
                    setTimeout(() => {
                        fetchTitles();
                    }, 1000);
                }
            })
            .catch((error) => console.error("Error submitting choice:", error));
    }

    function createStars() {
        ratingContainer.innerHTML = '';
        selectedRating = 0;
        for (let i = 1; i <= 5; i++) {
            const star = document.createElement('span');
            star.textContent = '★';
            star.classList.add('star');
            star.setAttribute('data-value', i);

            star.addEventListener('click', () => {
                selectedRating = i;
                const stars = ratingContainer.querySelectorAll('.star');
                stars.forEach((s, index) => {
                    if (index < i) {
                        s.classList.add('selected');
                    } else {
                        s.classList.remove('selected');
                    }
                });
                const endTime = new Date().getTime();
                const timeTaken = (endTime - startTime) / 1000;
                sendChoice(chosenTitle, timeTaken, selectedRating);
            });

            star.addEventListener('mouseover', () => {
                const stars = ratingContainer.querySelectorAll('.star');
                stars.forEach((s, index) => {
                    if (index < i) {
                        s.classList.add('selected');
                    } else {
                        s.classList.remove('selected');
                    }
                });
            });

            star.addEventListener('mouseleave', () => {
                if (selectedRating === 0) {
                    const stars = ratingContainer.querySelectorAll('.star');
                    stars.forEach(s => {
                        s.classList.remove('selected');
                    });
                } else {
                    const stars = ratingContainer.querySelectorAll('.star');
                    stars.forEach((s, index) => {
                        if (index < selectedRating) {
                            s.classList.add('selected');
                        } else {
                            s.classList.remove('selected');
                        }
                    });
                }
            });

            ratingContainer.appendChild(star);
        }
    }

    function showElement(element) {
        element.classList.remove('fade-exit-active');
        element.style.display = 'block';
        requestAnimationFrame(() => {
            element.classList.add('fade-enter');
            requestAnimationFrame(() => {
                element.classList.add('fade-enter-active');
                element.classList.remove('fade-enter');
            });
        });
    }

    function hideElement(element) {
        element.classList.remove('fade-enter-active');
        element.classList.add('fade-exit');
        requestAnimationFrame(() => {
            element.classList.add('fade-exit-active');
            element.classList.remove('fade-exit');
        });
        setTimeout(() => {
            element.style.display = 'none';
        }, 500);
    }

    fetchTitles();
});
