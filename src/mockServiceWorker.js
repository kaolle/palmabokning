// src/mockServiceWorker.js
import { setupServer } from 'msw/node';
import { rest } from 'msw';

const fromDate = '1963-01-17';
const toDate = '1963-01-20';
const famillyMember = 'Eskilera';
const server = setupServer(
    rest.get('http://localhost:8080/booking', (req, res, ctx) => {
        // Define the mock response for the API endpoint
        return res(
            ctx.status(200),
            ctx.json([
                {
                    from: fromDate + 'T11:49:43.384370800Z',
                    to: toDate + 'T11:49:43.384370800Z',
                    familyMember: {
                        uuid: 'a422855a-1db2-415c-ba2d-14da242afab9',
                        name: famillyMember,
                    },
                },
                // Add more mock data as needed
            ])
        );
    })
);

export { server, fromDate, toDate, famillyMember };
