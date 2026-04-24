async function loadNews() {
    try {
        const response = await fetch("http://localhost:3000/api/news");
        const data = await response.json();

        const container = document.getElementById("newsContainer");

        data.forEach(article => {
            const div = document.createElement("div");
            div.classList.add("news-card");

            div.innerHTML = `
                <h3>${article.title}</h3>
                <p>${article.summary}</p>
            `;

            container.appendChild(div);
        });

    } catch (error) {
        console.error("Error loading news:", error);
    }
}

loadNews();