const fs = require('fs');
const csv = require('csv-parser');
const axios = require('axios');

axios.defaults.baseURL = 'https://stucse.kuali.co/';
axios.defaults.headers.common['Authorization'] = `Bearer ${process.env.TOKEN}`;

const getAllData = async () => {
    try {
        let data = [];
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

const postData = (row, data) => {
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
        let locationId = data.campuses.find(x => x.name === location).id;
        campus[locationId] = true;
    });

    let date = {
        winter: '01-01',
        spring: '04-03',
        summer: '07-04',
        fall: '10-04',
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

    let postData = {
        subjectCode: data.subjectcodes.find(x => x.name === row.subjectCode).id ?? '',
        number: row.number,
        title: row.title,
        credits: {
            chosen: creditType,
            credits: creditDetails,
            value: value,
        },
        status: 'draft',
        dateStart: `${year}-${date[season]}`,
        groupFilter1: data.groups.find(x => x.name === row.department)?.id ?? '',
        groupFilter2: data.groups.find(x => x.name === row.department)?.parentId ?? '',
        campus: { ...campus },
        notes: 'Submitted by Nick Jenson',
    };
    console.log(postData);
};


(async () => {
    const data = await getAllData();
    fs.createReadStream('data/courses.csv')
        .pipe(csv())
        .on('data', row => {
            postData(row, data);
        })
        .on('end', () => {
            console.log('complete');
        });
})();