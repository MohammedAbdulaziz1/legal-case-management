import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { USER_ROLES } from '../../utils/constants'

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated } = useAuth()
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  if (user?.role !== USER_ROLES.ADMIN) {
    return <Navigate to="/dashboard" replace />
  }
  
  return children
}

export default AdminRoute
