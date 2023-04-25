import {NewsItem} from "../interfaces";
import {getApiClientKey} from "./engine";
import {NAVER_API_URL, RSEARCHAPI, RTRENDAPI} from "../helpers/common";
import axios, {AxiosResponse} from 'axios';
import moment from "moment";
import {generate} from "../helpers/utils";

interface AgeRatio {
    age_10: number;
    age_20: number;
    age_30: number;
    age_40: number;
    age_50: number;
}

interface Keyword {
    relKeyword: string;
    monthlyPcQcCnt: number;
    monthlyMobileQcCnt: number;
    monthlyAvePcClkCnt: number;
    monthlyAveMobileClkCnt: number;
    monthlyAvePcCtr: number;
    monthlyAveMobileCtr: number;
    plAvgDepth: number;
    compIdx: number;
}

interface ApiResponse {
    keywordList: Keyword[];
}

type MonthlyData = {
    relKeyword: string;
    monthlyPcQcCnt: number;
    monthlyMobileQcCnt: number;
};

type PeriodData = {
    totalCount: number;
    //mobileCount: number;
    //pcCount: number;
    period: string;
    ratio: number;
    //mobileRatio: number;
    //pcRatio: number;
};
type RateData = {
    female: number;
    male: number;
    age_10: number;
    age_20: number;
    age_30: number;
    age_40: number;
    age_50: number;
};

type DailyData = {
    title: string;
    keywords: string[];
    relKeywords: string[];
    blogCount: number;
    newsCount: number;
    pcCount: number;
    mobileCount: number;
    rate: RateData;
    daily: PeriodData[];
};


async function getSearchRate(query: string, start?: string, end?: string) {
    const {client_id, client_secret} = await getApiClientKey(RTRENDAPI,9);
    const api_url = 'https://openapi.naver.com/v1/datalab/search'; // JSON 결과
    const options = {
        headers: {
            'X-Naver-Client-Id': client_id,
            'X-Naver-Client-Secret': client_secret,
            'Content-Type': 'application/json'
        }
    };

    const monthAgo = moment().subtract(1, 'month').format('YYYY-MM-DD');
    const startDate = start && moment(start).isAfter(monthAgo) ? monthAgo : start;
    const endDate = end ?? moment().subtract(1, 'day').format('YYYY-MM-DD');
    const data = {
        "startDate": startDate,
        "endDate": endDate,
        timeUnit: 'date',
        // device: 'mo',
        keywordGroups: [
            {
                groupName: query,
                keywords: query.split(',')
            }
        ],
        ages: [],
        gender: ''
    };

    const [results_all/*, results_pc*/, results_female, results_male, results_10, results_20, results_30, results_40, results_50] = await Promise.all([
        axios.post(api_url, data, options).then(response => response.data.results[0].data),
       // axios.post(api_url, {...data, device: 'pc'}, options).then(response => response.data.results[0].data),
        axios.post(api_url, {
            ...data,
            "startDate": monthAgo,
            timeUnit: 'month',
            device: '',
            gender: 'f'
        }, options).then(response => response.data.results[0].data),
        axios.post(api_url, {
            ...data,
            "startDate": monthAgo,
            timeUnit: 'month',
            device: '',
            gender: 'm'
        }, options).then(response => response.data.results[0].data),
        axios.post(api_url, {
            ...data,
            "startDate": monthAgo,
            timeUnit: 'month',
            device: '',
            gender: '',
            ages: ["1", "2"]
        }, options).then(response => response.data.results[0].data),
        axios.post(api_url, {
            ...data,
            "startDate": monthAgo,
            timeUnit: 'month',
            device: '',
            gender: '',
            ages: ["3", "4"]
        }, options).then(response => response.data.results[0].data),
        axios.post(api_url, {
            ...data,
            "startDate": monthAgo,
            timeUnit: 'month',
            device: '',
            gender: '',
            ages: ["5", "6"]
        }, options).then(response => response.data.results[0].data),
        axios.post(api_url, {
            ...data,
            "startDate": monthAgo,
            timeUnit: 'month',
            device: '',
            gender: '',
            ages: ["7", "8"]
        }, options).then(response => response.data.results[0].data),
        axios.post(api_url, {
            ...data,
            "startDate": monthAgo,
            timeUnit: 'month',
            device: '',
            gender: '',
            ages: ["9", "10"]
        }, options).then(response => response.data.results[0].data),
    ]);

    return {
        rate: results_all,
        female: results_female,
        male: results_male,
        age_10: results_10,
        age_20: results_20,
        age_30: results_30,
        age_40: results_40,
        age_50: results_50
    };


}

// https://openapi.naver.com/v1/search/blog.json
//     https://api.naver.com/keywordstool
// {"api_key": "0100000000141b6de97be2e0dc28b53c8478a7be307a14984163150d8bc486a094903beb33", "secret_key": "AQAAAAAUG23pe+Lg3Ci1PIR4p74wzaSaga4fm2MuG0k9oSuf1w==", "customer_id": "2660230"}
// {"api_key": "0100000000ebac20c49c87f54d7484dcca28e33b309f9c1f20ae434927643405db8c6742db", "secret_key": "AQAAAADrrCDEnIf1TXSE3Moo4zswMDrCRL+chZU7fF/fdJU/zA==", "customer_id": "2660231"}
// {"api_key": "0100000000791fa2ea6e26b97ce3cf27023dde23bd72b1a242d7017b6983a424107c2595b7", "secret_key": "AQAAAAB5H6Lqbia5fOPPJwI93iO9V5ILgNqNFFbf1qxzanMp5A==", "customer_id": "2660374"}
export async function getRelKeyword(query, start, end): Promise<DailyData> {
    const BASE_URL = 'https://api.naver.com';
    const API_KEY = '0100000000141b6de97be2e0dc28b53c8478a7be307a14984163150d8bc486a094903beb33';
    const SECRET_KEY = 'AQAAAAAUG23pe+Lg3Ci1PIR4p74wzaSaga4fm2MuG0k9oSuf1w==';
    const CUSTOMER_ID = '2660230';
    const uri = '/keywordstool';
    const method = 'GET';

    const headers = {
        'Content-Type': 'application/json; charset=UTF-8',
        'X-API-KEY': API_KEY,
        'X-Customer': CUSTOMER_ID,
    };

    const params = {

        hintKeywords: query,
        showDetail: '1',
    };

    const timestamp = String(Date.now());
    const signature = generate(timestamp, method, uri, SECRET_KEY);

    headers['X-Timestamp'] = timestamp;
    headers['X-Signature'] = signature;

    const response = await axios.get<ApiResponse>(`${BASE_URL}${uri}`, {
        params,
        headers,
    });
    const sortedNews = response.data.keywordList
        .filter(v => v.relKeyword !== query) // exclude query data
        .sort((a, b) => (b.monthlyPcQcCnt + b.monthlyMobileQcCnt) - (a.monthlyPcQcCnt + a.monthlyMobileQcCnt))
        .slice(0, 10);
    const searchRel = sortedNews
        .filter(v => v.relKeyword !== query) // exclude query data
        .map(v => v.relKeyword) // extract relKeyword properties
    console.log(response.data.keywordList[0])
    const monthlyData: MonthlyData = {
        relKeyword: response.data.keywordList[0].relKeyword,
        monthlyPcQcCnt: response.data.keywordList[0].monthlyPcQcCnt,
        monthlyMobileQcCnt: response.data.keywordList[0].monthlyMobileQcCnt,
    };

    const dataBlog = await getRelBlogCount(query, 1);
    const dataNews = await getRelNewsCount(query, 1);
    const {rate, female, male, age_10, age_20, age_30, age_40, age_50} = await getSearchRate(query, start, end);
    /*   const periodData: PeriodData[] = mobile.map((item: any, idx) => ({
               period: item.period,
               mobileRatio: item.ratio,
               pcRatio: pc[idx]?.ratio || 0
       }));*/
    const periodData: any[] = [];

    // const rateMap = new Map(rate.map(({period, ratio}) => [period, ratio]));
   // const pcMap = new Map(pc.map(({period, ratio}) => [period, ratio]));

    //const allPeriods = [...new Set([...mobile.map((item) => item.period), ...pc.map((item) => item.period)])];

    /*for (const period of allPeriods) {
        const mobileRatio = mobileMap.get(period) || 0;
        const pcRatio = pcMap.get(period) || 0;
        periodData.push({period, mobileRatio, pcRatio});
    }*/
    const gender = getGenderRatios({female, male})
    const age = getAgeRatios({age_10, age_20, age_30, age_40, age_50})
    console.log(age)
    const filteredData = rate.filter(dailyRatio => dailyRatio.period >= start);
    const dailyData: DailyData = {

        title: monthlyData.relKeyword,
        keywords: [monthlyData.relKeyword],
        relKeywords: searchRel,
        blogCount: dataBlog,
        newsCount: dataNews,
        rate: {
            female: gender.female,
            male: gender.male,
            age_10: age.age_10,
            age_20: age.age_20,
            age_30: age.age_30,
            age_40: age.age_40,
            age_50: age.age_50
        },
        pcCount: monthlyData.monthlyPcQcCnt,
        mobileCount: monthlyData.monthlyMobileQcCnt,
        daily: filteredData,
    };

    const allRatioSum = rate.slice().reverse().slice(0, 30).reduce((sum, value) => {
        return sum + value.ratio;
    }, 0);

    const sumPercent = (monthlyData.monthlyMobileQcCnt+monthlyData.monthlyPcQcCnt) / allRatioSum;
    dailyData.daily.forEach((item) => {
         const allCount = Math.round(sumPercent * item.ratio);

        item.totalCount = allCount;
    });

    // return dailyData;
    /*console.log(params)
    console.log(response.data)*/
    return dailyData;
}



function getGenderRatios(ratios: any): Record<string, number> {
    const femaleRatio = (ratios.female.reduce((acc, curr) => acc + curr.ratio, 0) + 100);
    const maleRatio = (ratios.male.reduce((acc, curr) => acc + curr.ratio, 0) + 100);
    const totalRatio = femaleRatio + maleRatio;
    const femalePercentage = parseFloat(((femaleRatio / totalRatio) * 100).toFixed(2))
    const malePercentage =  parseFloat(((maleRatio / totalRatio) * 100).toFixed(2));
    return {
        female: femalePercentage,
        male: malePercentage,
    };
}

interface AgeRatio {
    [ageGroup: string]: number;
}

interface AgeGroupData {
    period: string;
    ratio: number;
}

interface AgeGroupDataCollection {
    [ageGroup: string]: AgeGroupData[];
}

function getAgeRatios(data: AgeGroupDataCollection): AgeRatio {
    console.log(data)
    const ageRatios: AgeRatio = {age_10:0 , age_20: 0, age_30: 0, age_40: 0, age_50: 0};
    let totalRatio = 0;

    Object.keys(data).forEach((ageGroup) => {
        const ageGroupData = data[ageGroup];
        const currentRatio = ageGroupData.reduce((acc, curr) => acc + curr.ratio, 0);
        ageRatios[ageGroup] = currentRatio;
        totalRatio += currentRatio;
    });

    Object.keys(ageRatios).forEach((ageGroup) => {
        ageRatios[ageGroup] = parseFloat(((ageRatios[ageGroup] / totalRatio) * 100).toFixed(2));
    });

    return ageRatios;
}


async function getSearchRateAndCount(query: string, start?: string, end?: string) {
    // 네이버 데이터랩 API를 사용하여 검색 추이 조회


    const clientInfo = await getApiClientKey(RTRENDAPI,1);
    const apiUrl = 'https://openapi.naver.com/v1/datalab/search';
    const options = {
        headers: {
            'X-Naver-Client-Id': clientInfo.client_id,
            'X-Naver-Client-Secret': clientInfo.client_secret,
            'Content-Type': 'application/json',
        },
    };

    const monthAgo = moment().subtract(1, 'month').format('YYYY-MM-DD');
    const startDate = start && moment(start).isAfter(monthAgo) ? start : monthAgo;
    console.log("start"+start)
    console.log("monthAgo"+monthAgo)
    const endDate = end || moment().format('YYYY-MM-DD');
    const data = {
        startDate,
        endDate,
        timeUnit: 'date',
        device: 'pc',
        keywordGroups: [
            {
                groupName: query,
                keywords: query.split(','),
            },
        ],
        ages: [],
        gender: '',
    };
    const response = await axios.post(apiUrl, data, options);
    const results = response.data.results[0].data;
    const searchRate = results.map((result: any) => ({
        period: result.period,
        ratio: result.ratio,
    }));

    // 네이버 키워드 도구 API를 사용하여 검색량 조회
    const keywordToolUrl = 'https://api.naver.com/keywordstool';
    const keywordToolOptions = {
        headers: {
            'X-Naver-Client-Id': clientInfo.client_id,
            'X-Naver-Client-Secret': clientInfo.client_secret,
            'Content-Type': 'application/json',
        },
    };
    const keywordToolData = {
        hintKeywords: query,
        showDetail: 1,
        useHintKeyword: 1,
        includeHintKeyword: 1,
        month: moment(startDate).format('YYYYMM'),
    };
    const keywordToolResponse = await axios.post(keywordToolUrl, keywordToolData, keywordToolOptions);
    const keywordToolResults = keywordToolResponse.data.keywordList;
    const searchCount = keywordToolResults.reduce((acc: number, result: any) => acc + result.monthlyPcQcCnt, 0);

    return {searchRate, searchCount};
}


async function getRelBlogCount(query: string, start: number = 1): Promise<number> {
    const clientInfo = await getApiClientKey(RSEARCHAPI,1);
    let api_url = `https://openapi.naver.com/v1/search/blog.json?query=${encodeURI(query)}&start=${start}&display=1`; // JSON 결과
    let options = {
        headers: {
            'X-Naver-Client-Id': clientInfo.client_id,
            'X-Naver-Client-Secret': clientInfo.client_secret,
            withCredentials: true
        }
    };
    const {data} = await axios.get(api_url, options);


    // const result = data.items.map(item => item.title ? {...item, "title": `${item.title}_${start}`} : '')
    return data.total
}

async function getRelNewsCount(query: string, start: number = 1): Promise<number> {
    const clientInfo = await getApiClientKey(RSEARCHAPI,1);
    let api_url = `${NAVER_API_URL}?query=${encodeURI(query)}&start=${start}&display=1`; // JSON 결과
    let options = {
        headers: {
            'X-Naver-Client-Id': clientInfo.client_id,
            'X-Naver-Client-Secret': clientInfo.client_secret,
            withCredentials: true
        }
    };
    const {data} = await axios.get(api_url, options);
    return data.total
}
async function trendStats(keyword) {
    const token = "AAAAOfOGaGw7n5iGvh5mU9l69TeBJk9aYhJ9vt1lkUvIT8hMwQ598IgXdPPS5sy0pDhn2nX9G-8sEFnabG0gkG9aQCo"
    const response = await axios.get('https://manage.searchad.naver.com/keywordstool', {
        params: {
            format: 'json',
            keyword: keyword,
        },
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (response.status >= 400) {
        throw new Error(`${response.status}: ${response.statusText}`);
    }
        console.log(response.data['keywordList'][0]['userStat'])
    return response.data['keywordList'][0]['userStat'];
}

function extractPeriods(data: any[]): string[] {
    const periods: string[] = [];
    data.forEach((item: any) => {
        if (!periods.includes(item.period)) {
            periods.push(item.period);
        }
    });
    return periods;
}
