const apiUrl = () => Cypress.env('githubApiUrl');
const githubToken = () => Cypress.env('githubToken');
const githubUser = () => Cypress.env('githubUser');

describe('API do GitHub - ciclo de vida de um repositorio', () => {
  const repositoryName = `desafio-nexdom-${Date.now()}`;
  const issueTitle = 'Issue criada pelo teste automatizado';

  before(() => {
    // mensagem de erro caso nao tenha preenchido o arquivo cypress.env.json 
    // com githubToken e githubUser
    if (!githubToken() || !githubUser()) {
      throw new Error('Preencha githubToken e githubUser no arquivo cypress.env.json.');
    }
  });

  const requestHeaders = () => ({
    Authorization: `Bearer ${githubToken()}`,
    Accept: 'application/vnd.github+json'
  });

  const repositoryUrl = () => `${apiUrl()}/repos/${githubUser()}/${repositoryName}`;

  // nome do repositorio leva timestamp pra nao colidir em execucoes repetidas
  const criarRepositorio = () => cy.request({
      method: 'POST',
      url: `${apiUrl()}/user/repos`,
      headers: requestHeaders(),
      body: {
        name: repositoryName,
        description: 'Repositorio temporario do desafio de QA NEXDOM',
        private: true,
        auto_init: true
      }
  });

  const consultarRepositorio = () => cy.request({
    method: 'GET',
    url: repositoryUrl(),
    headers: requestHeaders()
  });

  const criarIssue = () => cy.request({
    method: 'POST',
    url: `${repositoryUrl()}/issues`,
    headers: requestHeaders(),
    body: {
      title: issueTitle,
      body: 'Validacao do fluxo de issues.'
    }
  });

  const consultarIssue = (issueNumber) => cy.request({
    method: 'GET',
    url: `${repositoryUrl()}/issues/${issueNumber}`,
    headers: requestHeaders()
  });

  const excluirRepositorio = () => cy.request({
    method: 'DELETE',
    url: repositoryUrl(),
    headers: requestHeaders(),
    failOnStatusCode: false
  });

  const confirmarExclusao = () => cy.request({
    method: 'GET',
    url: repositoryUrl(),
    headers: requestHeaders(),
    failOnStatusCode: false
  });
  after(() => {
  // Limpeza de segurança:
  // se o teste falhar antes de excluir o repositório,
  // este hook tenta removê-lo ao final da execução.
  if (!githubToken() || !githubUser()) {
    return;
  }

  return excluirRepositorio().then((cleanupResponse) => {
    expect([204, 404]).to.include(cleanupResponse.status);

    if (cleanupResponse.status === 204) {
      cy.log('Repositório temporário removido pela limpeza de segurança.');
    }

    if (cleanupResponse.status === 404) {
      cy.log('O repositório temporário já havia sido removido pelo teste.');
    }
  });
  });
  it('deve criar, consultar, usar e excluir um repositorio', () => {
    // cria o repositorio e confere se voltou com o nome certo
    criarRepositorio().then((createResponse) => {
      expect(createResponse.status).to.eq(201);
      expect(createResponse.body.name).to.eq(repositoryName);
      expect(createResponse.body.private).to.eq(true);
    });

    // repositorio criado precisa aparecer em uma consulta normal
    consultarRepositorio().then((repositoryResponse) => {
      expect(repositoryResponse.status).to.eq(200);
      expect(repositoryResponse.body.full_name).to.eq(`${githubUser()}/${repositoryName}`);
    });

    // cria uma issue e ja usa o numero dela pra consultar em seguida
    criarIssue().then((issueResponse) => {
      expect(issueResponse.status).to.eq(201);
      return consultarIssue(issueResponse.body.number);
    }).then((issueResponse) => {
      expect(issueResponse.status).to.eq(200);
      expect(issueResponse.body.title).to.eq(issueTitle);
    });

    // por fim, exclui o repositorio e confirma que ele sumiu (404)
    excluirRepositorio().then((deleteResponse) => {
      expect(deleteResponse.status).to.eq(204);
    });

    confirmarExclusao().then((deletedResponse) => {
      expect(deletedResponse.status).to.eq(404);
    });
  });
});
