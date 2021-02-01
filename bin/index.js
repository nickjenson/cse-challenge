#!/usr/bin/env node

const fs = require('fs');
const csv = require('csv-parser');
const yargs = require("yargs");
const axios = require('axios');

const options = yargs
 .usage("Usage: -t <token>")
 .option("t", { alias: "token", describe: "your token", type: "string", demandOption: true })
 .help()
 .argv;

axios.defaults.baseURL = 'https://stucse.kuali.co/';
axios.defaults.headers.common['Authorization'] = `Bearer ${options.token}`;

/**
 * getAllData (and getData) function(s) fetch contextual information we need
 * and stores them in a data object
 */
const getAllData = async () => {
    try {
        const data = {};
        data.subjectcodes = await getData('/api/cm/options/types/subjectcodes');
        data.campuses = await getData('/api/cm/options/types/campuses');
        data.groups = await getData('/api/v1/groups');
        return data;
    } catch (error) {
       console.log(error);
    }
};

const getData = async url => {
    const response = await axios.get(url);
    return response.data;
};

/**
 * buildPayload takes the csv row information and combines it with the contextual
 * information we've fetched from getAllData to handle the payload logic 
 */
const buildPayload = (row, data) => {
    const creditType = row.creditType,
        min = row.creditsMin,
        max = row.creditsMax,
        start = row.dateStart.split(' '),
        season = start[0].toLowerCase(),
        year = start[1],
        campuses = row.campus.split(',');
    let creditDetails, value;

    const campus = {};
    campuses.forEach(location => {
        let locationId = data.campuses.find(c => c.name === location).id;
        campus[locationId] = true;
    });

    const date = {
        winter: '01-01',
        spring: '04-03',
        summer: '07-04',
        fall: '10-04'
    };

    switch (creditType) {
        case 'multiple':
            creditDetails = { min: min, max: max };
            value = [min, max];
            break;

        case 'range':
            creditDetails = { min: min, max: max };
            value = creditDetails;
            break;

        default:
            creditDetails = { min: min, max: min };
            value = min;
    }

    const payload = {
        subjectCode: data.subjectcodes.find(x => x.name === row.subjectCode).id ?? '',
        number: row.number,
        title: row.title,
        credits: {
            chosen: creditType,
            credits: creditDetails,
            value: value
        },
        status: 'draft',
        dateStart: `${year}-${date[season]}`,
        groupFilter1: data.groups.find(y => y.name === row.department)?.id ?? '',
        groupFilter2: data.groups.find(z => z.name === row.department)?.parentId ?? '',
        campus: { ...campus },
        notes: 'Submitted by Nick Jenson'
    };
    postData(payload);
};

const postData = async payload => {
    console.log(payload);
    // const response = await axios.post('', payload);
    // console.log(response.data);
};

/**
 * starts the script by:
 * 1. fetching contextual data
 * 2. reading csv
 * 3. passing data & row information through buildPayload
 */
(async () => { 
    const data = await getAllData();
    fs.createReadStream('data/courses.csv')
        .pipe(csv())
        .on('data', row => {
            buildPayload(row, data);
        })
        .on('end', () => {
            console.log('complete');
        });
})();