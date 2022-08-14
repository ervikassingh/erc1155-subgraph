const axios = require('axios');
const uri = '*END POINT*';

async function makeReq(query) {
    try {
        let res = await axios.post(uri, {
            'query': query
        });

        console.log(`statusCode: ${res.status}`);
        console.log(res.data);

        return res.data.data;
    } catch(error) {
        console.error(error);
    }
};

async function get() {
    let query =
    `
    {
        nfts(first: 10) {
            id
            tokenId
            owners {
                id
            }
            values
        }
    }
    `;
    let res = await makeReq(query);
    console.log(res);
};

get();