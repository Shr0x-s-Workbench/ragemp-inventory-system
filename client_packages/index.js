try {
    require('./inventory');
} catch (err) {
    mp.console.logError(JSON.stringify(err));
}
