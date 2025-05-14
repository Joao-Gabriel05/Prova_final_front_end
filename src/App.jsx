import { useEffect, useState } from 'react'
import './App.css'
import LogoutButton from './components/LogoutButton'
import { useAuth0 } from '@auth0/auth0-react'

function App() {
  const [token, setToken] = useState(null)
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [prioridade, setPrioridade] = useState('')
  const [tarefas, setTarefas] = useState([])
  const [roles, setRoles] = useState([])

  const {
    user,
    isAuthenticated,
    isLoading,
    getAccessTokenSilently,
    loginWithRedirect
  } = useAuth0()
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      loginWithRedirect()
    }
  }, [isLoading, isAuthenticated, loginWithRedirect])

  useEffect(() => {
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]))
      setRoles(payload['https://musica-insper.com/roles'] || [])

      fetch('http://15.229.14.61:8081/tarefa', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + token
        }
      })
        .then(response => response.json())
        .then(data => setTarefas(data))
        .catch(error => alert('Erro ao listar tarefas: ' + error))
    }
  }, [token])

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const accessToken = await getAccessTokenSilently()
        setToken(accessToken)
      } catch (e) {
        console.error('Erro ao buscar token:', e)
      }
    }

    if (isAuthenticated) {
      fetchToken()
    }
  }, [isAuthenticated, getAccessTokenSilently])

  if (isLoading) {
    return <div>Loading ...</div>
  }

  if (!token) {
    return <div>Redirecionando para login...</div>
  }

  function salvarTarefa() {
    fetch('http://15.229.14.61:8081/tarefa', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ titulo, descricao, prioridade })
    })
      .then(response => response.json())
      .then(() => {
        setTitulo('')
        setDescricao('')
        setPrioridade('')
        return fetch('http://15.229.14.61:8081/tarefa', {
          headers: { 'Authorization': 'Bearer ' + token }
        })
      })
      .then(res => res.json())
      .then(data => setTarefas(data))
      .catch(error => alert('Erro ao salvar tarefa: ' + error))
  }

  function excluirTarefa(id) {
    fetch(`http://15.229.14.61:8081/tarefa/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer ' + token
      }
    })
      .then(() => setTarefas(prev => prev.filter(t => t.id !== id)))
      .catch(error => alert('Erro ao excluir tarefa: ' + error))
  }

  return (
    <div className="App">
      <header>
        <img src={user.picture} alt={user.name} />
        <h2>{user.name}</h2>
        <p>{user.email}</p>
        <LogoutButton />
      </header>

      {roles.includes('ADMIN') && (
        <section className="formulario">
          <h3>Cadastrar Tarefa</h3>
          <label>
            Título:
            <input
              type="text"
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
            />
          </label>
          <label>
            Descrição:
            <input
              type="text"
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
            />
          </label>
          <label>
            Prioridade:
            <select
              value={prioridade}
              onChange={e => setPrioridade(e.target.value)}
            >
              <option value="">Selecione</option>
              <option value="BAIXA">Baixa</option>
              <option value="MEDIA">Média</option>
              <option value="ALTA">Alta</option>
            </select>
          </label>
          <button onClick={salvarTarefa}>Cadastrar</button>
        </section>
      )}

      <section className="lista">
        <h3>Lista de Tarefas</h3>
        <table>
          <thead>
            <tr>
              <th>Título</th>
              <th>Descrição</th>
              <th>Prioridade</th>
              <th>Usuário</th>
              {roles.includes('ADMIN') && <th>Ações</th>}
            </tr>
          </thead>
          <tbody>
            {tarefas.map(t => (
              <tr key={t.id}>
                <td>{t.titulo}</td>
                <td>{t.descricao}</td>
                <td>{t.prioridade}</td>
                <td>{t.email}</td>
                {roles.includes('ADMIN') && (
                  <td>
                    <button onClick={() => excluirTarefa(t.id)}>
                      Excluir
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}

export default App