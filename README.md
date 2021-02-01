# cse-challenge

## Submission (as per [cse-challenge](https://github.com/KualiCo/cse-challenge))
- Create a GitHub repo and send along the link
- Commit your work as you work documenting each commit
- Make sure not to commit the API key you've been given

### Provided Example
```
{
  "subjectCode": "6012dd6a016ce30026cbd08d",
  "number": "101",
  "title": "Accounting 101",
  "credits": {
    "chosen": "fixed",
    "credits": {
      "min": "3",
      "max": "3"
    },
    "value": "3"
  },
  "status": "draft",
  "dateStart": "2021-04-03",
  "groupFilter1": "6012e9eaffe5da00a2a51cbb",
  "groupFilter2": "6012e96effe5da00a2a51cb9",
  "campus": {
    "6012de03baa3f800262b5dbf": true,
    "6012ddfbe43ec1002784e1c5": true
  },
  "notes": "Submitted by <my name>"
}
```

## Approach and Notes
1. Read data from the provided CSV
1. There are several pieces of information we will need to retrieve:
    1. `subjectCode` - identifier of the subject 
        1. (ex. ACCT is 6012dd6a016ce30026cbd08d) @ `/api/cm/options/types/subjectcodes`
    1. `groupFilter1` and `groupFilter2` - identifier and parent identifier for the respective group
    1. `campus` - identifier for the campus 
        1. (ex. North is 6012ddf35a84800027c335e3) @ `/api/cm/options/types/campuses`
