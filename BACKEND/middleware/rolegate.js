function roleGate(allowedRoles) {
    return function(req, res, next) {
        const role = req.headers['x-user-role'];
        if (!role) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized: no role provided. Please log in.'
            });
        }
        if (!allowedRoles.includes(role)) {
            return res.status(403).json({
                success: false,
                error: `Forbidden: '${role}' role cannot perform this action. Required: ${allowedRoles.join(' or ')}.`
            });
        }
        next();
    };
}
module.exports = roleGate;
