const notFound = (req, res) => {
    return res.status(404).json({err: 'resource not found'})
}
module.exports = notFound