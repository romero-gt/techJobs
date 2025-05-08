window.onload = () => {
    carregarVagas();
    mostrarCandidatos();
}

async function carregarVagas () {
    try {
        const { data : vagas } = await axios.get('http://localhost:3000/jobs');
        mostrarVagas(vagas);
    } catch (error) {
        console.log(error);
        
        mostrarErro('Erro ao carregar vagas!')
    }
}

function mostrarVagas(vagas) {
    const container = document.getElementById('job-list');
    console.log(vagas);
    
    container.innerHTML = vagas.map(vaga =>
         `
    <div class="col-md-4 mb-4">
      <div class="card border-info shadow-sm">
        <div class="card-body">
          <h5 class="card-title">${vaga.title}</h5>
          <p class="card-text"><strong>Empresa:</strong> ${vaga.company}</p>
          <p class="card-text">
            <span class="badge rounded-pill bg-info text-muted">
              ${vaga.location || 'Não informado'}
            </span>
          </p>
        </div>
      </div>
    </div>
        `
    ).join('');
}

function carregarCandidatos() {
    axios.get('http://localhost:3000/users')
        .then(res => mostrarCandidatos(res.data))
        .catch(() => mostrarErro('Erro ao buscar candidatos'));
}

function mostrarCandidatos(candidatos) {
  const container = document.getElementById('candidates');
  container.innerHTML = candidatos.map(user => 
    `
    <div class="col-md-4 mb-3">
      <div class="card border-primary shadow-sm">
        <div class="card-body">
          <h5 class="card-title">${user.name}</h5>
          <h6 class="card-subtitle mb-2 text-muted">${user.email}</h6>
          <div class="mt-3">
            <button class="btn btn-sm btn-warning me-2" onclick="abrirModalUsuario('editar', '${user.id}')">Editar</button>
            <button class="btn btn-sm btn-danger" onclick="excluirUsuario('${user.id}')">Excluir</button>
          </div>
        </div>
      </div>
    </div>
    `
  ).join('');
}

function abrirModalUsuario(acao, id = null) {
  const titulo = acao == 'editar' ? 'Editar candidato' : 'Novo Candidato';

  const exibirFormulario = (nome = '', email = '') => {
    Swal.fire({
      title: titulo,
      html:`
        <input id="swal-nome" class="swal2-input" placeholder="Nome" value="${nome}">
        <input id="swal-email" class="swal2-input" placeholder="Email" value="${email}">
      `,
      confirmButtonText:'Salvar',
      focusConfirm: false,
      preConfirm: () => {
        const nome = document.getElementById('swal-nome').value.trim();
        const email = document.getElementById('swal-email').value.trim();


        if (!nome || !email) {
          Swal.showValidationMessage('Preencha todos os campos');
          return false;
        }

        return {name: nome, email:email};
      }
    }).then(result => {
      if(!result.isConfirmed) return;

      const url = id ? `http://localhost:3000/user/${id}` : `http://localhost:3000/users/`;

      const metodo = id ? axios.put : axios.post;

      metodo(url, result.value)
      .then(() =>{
        Swal.fire('Sucesso', `Candidato ${id ? 'atualizado' : 'cadastrado'}`, );
        carregarCandidatos();
      }).catch(() =>{
        mostrarErro('Não foi possivel passar')
      })
    })
  }

  if (acao == 'editar' && id) {
    axios.get(`http://localhost:3000/users/${id}`)
    .then(res => exibirFormulario(res.data.name, res.data.email))
    .catch(() => mostrarErro('Usuario não encontrado'));
  } else {
    exibirFormulario();
  }
}

window.createUser = () =>abrirModalUsuario('novo')

let candidatosVisiveis = false;
function alternarCandidados() {
  const container = document.getElementById('candidates');
  candidatosVisiveis = !candidatosVisiveis;
  container.style.display = candidatosVisiveis ? 'flex' : 'none';
  if (candidatosVisiveis) carregarCandidatos();
}

window.toggleCandidates = alternarCandidados;

function excluirUsuario(id) {
  Swal.fire({
    title: 'Tem certeza?',
    text: 'Essa ação não poderá ser desfeita!!!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sim, excluir',
    cancelButtonText: 'Cancelar'
  }).then( result => {
    if(!result.isConfirmed) return;

    axios.delete(`http://localhost:3000/users/${id}`)
      .then(() => {
        Swal.fire('Excluído!', 'Candidato removido.', 'success')
      })
      .catch(() => mostrarErro('Não foi possível excluir!'));
  });
  
}

function mostrarErro(msg) {
    Swal.fire('Erro', msg, 'error')
}