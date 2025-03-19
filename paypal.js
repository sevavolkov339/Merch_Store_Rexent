const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');

//PayPal environment
let clientId = "ARM-L9jt_1QtP9RigivZgW0yJGNrMtScMozhQRtxZjF4ucQ-ywcHnnW_uEFtVdrEkIAWf5xuB9srxC4N";
let clientSecret = "EMuFSQqI9S8Z6a3jBlaKZl5kpA1CGgWpLZCph3ePRvBsZpZN0_rq8cOK1mNdrNgvRI1S-_wJzislimJZ";

function environment() {
    return new checkoutNodeJssdk.core.SandboxEnvironment(clientId, clientSecret);
}

//HTTP client instance
function client() {
    return new checkoutNodeJssdk.core.PayPalHttpClient(environment());
}

module.exports = { client };
