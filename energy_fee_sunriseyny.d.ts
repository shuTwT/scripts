export type SunriseynyResponse<T=any> = {
    success:boolean,
    code:number,
    message:string,
    data:T
}

export type queryCurMonthBillResp = SunriseynyResponse<{
    /**
     * 顾客 id
     */
    customerId: number,
    /**
     * 顾客类型
     */
    consumeType: number,
    /**
     * 数据时间
     */
    dataTime: '2026-01-31T16:00:00.000+00:00',
    /**
     * 电费
     */
    fee: number,
    /**
     * 用电量
     */
    energyTotal: number,
    /**
     * 更新时间
     */
    updateTime: '2026-02-10T07:38:54.000+00:00',
    /**
     * 年月字符串
     */
    dataTimeStr: '2026年02月',
    /**
     * 更新时间字符串
     */
    updateTimeStr: '2026-02-10 15:38:54'
}>