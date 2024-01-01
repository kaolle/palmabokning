import {describe} from "@jest/globals";
import {decodeAndSaveExpirationTime} from "./AuthContext";

describe('AuthContext', () => {

    it ('Can Parse jwt token', () => {

        const {jwtExpirationTimestamp, jwtTokenExpiresAt} = decodeAndSaveExpirationTime ('eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJrYW9sbGUiLCJpYXQiOjE3MDM4NzkzMDMsImV4cCI6MTcwMzk2NTcwM30.4nyUKf5x4EQMyK34v66sbdf--1VwogSmixdjEDe89hw')

        expect(jwtExpirationTimestamp).toEqual(1703965703);
    })
} )
