import app from '../../../app';
import supertest from 'supertest';
import { expect } from 'chai';
import mongoose from 'mongoose';
import shortid from 'shortid';

let firstUserIdTest = '';


let accessToken = '';
let refreshToken = '';
const firstName = 'Nnenna';
const lastName = 'Maryclaret';

const user1Body = {
    email: `test+${shortid.generate()}@test.com`,
    password: 'test!23',
    firstName: firstName,
    lastName: lastName
};

describe('users and auth endpoints', function () {
    let request: supertest.SuperAgentTest;
    before(function () {
        request = supertest.agent(app);
    });
    after(function (done) {
        app.close(() => {
            mongoose.connection.close(done);
        });
    });

    it('should allow a POST to /users', async function () {
        const res = await request.post('/users').send(user1Body);

        expect(res.status).to.equal(201);
        expect(res.body).not.to.be.empty;
        expect(res.body).to.be.an('object');
        expect(res.body.id).to.be.a('string');
        firstUserIdTest = res.body.id;
    });

    it('should allow a POST to /auth', async function () {
        const res = await request.post('/auth').send(user1Body);
        expect(res.status).to.equal(201);
        expect(res.body).not.to.be.empty;
        expect(res.body).to.be.an('object');
        expect(res.body.accessToken).to.be.a('string');
        accessToken = res.body.accessToken;
        refreshToken = res.body.refreshToken;
    });

    it('should allow a GET from /users/:userId with an access token', async function () {
        const res = await request
            .get(`/users/${firstUserIdTest}`)
            .set({ Authorization: `Bearer ${accessToken}` })
            .send();
        expect(res.status).to.equal(200);
        expect(res.body).not.to.be.empty;
        expect(res.body).to.be.an('object');
        expect(res.body._id).to.be.a('string');
        expect(res.body._id).to.equal(firstUserIdTest);
        expect(res.body.email).to.equal(user1Body.email);
    });

    describe('with a valid access token', function () {
        it('should allow a GET from /users', async function () {
            const res = await request
                .get(`/users`)
                .set({ Authorization: `Bearer ${accessToken}` })
                .send();
            expect(res.status).to.equal(403);
        });

   

        it('should disallow a PUT to /users/:userId with an wrong or invalid Object ID', async function () {
            const res = await request
                .put(`/users/i-do-not-exist`)
                .set({ Authorization: `Bearer ${accessToken}` })
                .send({
                    phoneNumber: '08123455',
                    imageUrl: 'https://www.google.com/'
                });
            expect(res.status).to.equal(400);
        });

        it('should disallow a PUT to /users/:userId/role/:role trying to change the permission flags', async function () {
            const res = await request
                .put(`/users/${firstUserIdTest}/role/2`)
                .set({ Authorization: `Bearer ${accessToken}` })
                .send();
            expect(res.status).to.equal(403);
            expect(res.body.errors).to.be.an('array');
            expect(res.body.errors).to.have.length(1);
            expect(res.body.errors[0]).to.equal(
                'Unauthorized request'
            );
        });

        describe('with a new set of permission flags', function () {
            it('should allow a POST to /auth/refresh-token', async function () {
                const res = await request
                    .post('/auth/refresh-token')
                    .set({ Authorization: `Bearer ${accessToken}` })
                    .send({ refreshToken });
                expect(res.status).to.equal(201);
                expect(res.body).not.to.be.empty;
                expect(res.body).to.be.an('object');
                expect(res.body.accessToken).to.be.a('string');
                accessToken = res.body.accessToken;
                refreshToken = res.body.refreshToken;
            });

            it('should allow a GET from /users/:userId and should have a new full name', async function () {
                const res = await request
                    .get(`/users/${firstUserIdTest}`)
                    .set({ Authorization: `Bearer ${accessToken}` })
                    .send();
                expect(res.status).to.equal(200);
                expect(res.body).not.to.be.empty;
                expect(res.body).to.be.an('object');
                expect(res.body._id).to.be.a('string');
                expect(res.body.firstName).to.equal(firstName);
                expect(res.body.lastName).to.equal(lastName);
                expect(res.body.email).to.equal(user1Body.email);
                expect(res.body._id).to.equal(firstUserIdTest);
            });
        });
    });
});
