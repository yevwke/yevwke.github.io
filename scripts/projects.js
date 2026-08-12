

const projects = [
    {
        title: "IsOnline",
        description: "Настольная ролевая игра про MMORPG в смешанной реальности",
        url: "https://isonline.yevwke.ru/"
    },
    {
        title: "Azar Map",
        description: "Интерактивная карта сеттинга Азар",
        url: "https://yevwke.github.io/AzarMap"
    },
    {
        title: "Хрустальные Сердца",
        description: "Настольная ролевая игра про гномов и шахты",
        url: "https://noraverse.itch.io/crystal-hearts"
    },
    {
        title: "Последний ветер",
        description: "Маленькая визуальная новелла",
        url: "https://yevwke.itch.io/enoa-tlw"
    },
    {
        title: "Азар",
        description: "НРИ-сеттинг с эстетикой малых народов севера",
        url: "https://taplink.cc/azarguide"
    }
];


function createProjectElement(project) {
    const item = document.createElement("li");
    item.className = "project-item";

    const link = document.createElement("a");
    link.className = "project-link";
    link.href = project.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    const text = document.createElement("span");
    text.className = "project-text";

    const title = document.createElement("span");
    title.className = "project-title";
    title.textContent = project.title;
    text.appendChild(title);

    if (project.description) {
        const description = document.createElement("span");
        description.className = "project-description";
        description.textContent = project.description;
        text.appendChild(description);
    }

    link.appendChild(text);
    item.appendChild(link);

    return item;
}



function renderProjects() {
    const container = document.getElementById("projects-list");

    if (!container) {
        return;
    }

    container.innerHTML = "";

    projects.forEach((project) => {
        container.appendChild(createProjectElement(project));
    });
}

