import { createRoot } from 'react-dom/client'
import '@xyflow/react/dist/style.css'
import './styles/shell.css'
import './styles/board.css'
import './styles/panel.css'
import './styles/tokens-ui.css'
import { App } from './App'

const container = document.getElementById('root')
if (!container) throw new Error('#root not found')

createRoot(container).render(<App />)
