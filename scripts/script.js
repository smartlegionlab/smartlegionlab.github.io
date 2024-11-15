const username = 'smartlegionlab';
const url = `https://api.github.com/users/${username}/repos?per_page=100`;
const repoList = document.getElementById('repo-list');
const showReposButton = document.getElementById('showRepos');

async function fetchAllRepos() {
  let allRepos = [];
  let page = 1;
  let hasMoreRepos = true;

  while (hasMoreRepos) {
    const response = await fetch(`${url}&page=${page}`);
    if (!response.ok) {
      throw new Error('Failed to load repositories. Please check your username or try again later.');
    }
    const repos = await response.json();
    allRepos = allRepos.concat(repos);
    hasMoreRepos = repos.length > 0;
    page++;
  }

  return allRepos;
}

function displayRepos(repos) {
  if (repos.length === 0) {
    const noReposMessage = document.createElement('p');
    noReposMessage.className = 'text-muted';
    noReposMessage.textContent = 'You don\'t have any repositories.';
    repoList.appendChild(noReposMessage);
  } else {
    repos.forEach(repo => {
      const listItem = document.createElement('a');
      listItem.className = 'list-group-item list-group-item-action';
      listItem.href = repo.html_url;
      listItem.target = '_blank';
      const createdAt = new Date(repo.created_at).toLocaleDateString();
      listItem.innerHTML = `
        <h5 class="mb-1 text-primary">${repo.name}</h5>
        <p class="mb-1">${repo.description || 'No description'}</p>
        <small class="text-muted">Created on: ${createdAt}</small>
      `;
      repoList.appendChild(listItem);
    });
  }
}

async function updateReposButton() {
  try {
    const repos = await fetchAllRepos();
    showReposButton.innerHTML = `Show Repositories <sup>${repos.length}</sup>`;
  } catch (error) {
    showReposButton.innerHTML = 'Show Repositories';
  }
}

updateReposButton();

showReposButton.addEventListener('click', () => {
  fetchAllRepos()
    .then(repos => {
      repoList.innerHTML = '';
      displayRepos(repos);
    })
    .catch(error => {
      const errorMessage = document.createElement('div');
      errorMessage.className = 'alert alert-danger';
      errorMessage.textContent = error.message;
      repoList.appendChild(errorMessage);
    });
});
