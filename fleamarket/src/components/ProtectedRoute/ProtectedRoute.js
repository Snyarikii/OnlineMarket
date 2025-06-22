import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles, user, loggingOut }) => {
    const location = useLocation();   

    if(loggingOut) {
        return null;
    }


    if(!user) {
        if (location.pathname !== '/' && location.pathname !== '/Login') {
            alert("You are not logged in. Redirecting to Login page.")
        }
        return <Navigate to='/Login' state={{ from: location}} replace />
    }

    if(!allowedRoles.includes(user.role)) {
        let redirectTo = '/';

        if(user.role === 'buyer') {
            alert("Unauthorized page.");
            redirectTo = '/Index';
        }
        else if (user.role === 'seller') {
            alert("Unauthorized page.");
            redirectTo = '/Dashboard';

        }
        else if (user.role === 'admin') {
            alert('Unauthorized page.');
            redirectTo = '/Admin';
        }

        return <Navigate to={redirectTo} replace />
    }

    return children;
}

export default ProtectedRoute;