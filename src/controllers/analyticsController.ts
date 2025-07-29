import { Request, Response } from 'express';
import { pool } from '../config/db';

export const getAnalytics = async (req: Request, res: Response) => {
  try {
    console.log('Analytics request received');
    
    // Get stock analysis data
    const stocksQuery = `
      SELECT 
        source,
        sentiment_score,
        signal_score,
        buy_price,
        last_gr,
        created_at
      FROM stock_analysis 
      WHERE sentiment_score IS NOT NULL
    `;
    
    console.log('Executing stocks query...');
    const stocksResult = await pool.query(stocksQuery);
    const stocks = stocksResult.rows;
    console.log(`Found ${stocks.length} stocks`);

    // Get ticker stats
    let tickerStats = { total: '0', active: '0' };
    try {
      const tickerStatsQuery = `
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN active = true THEN 1 END) as active
        FROM tickers
      `;
      
      const tickerStatsResult = await pool.query(tickerStatsQuery);
      tickerStats = tickerStatsResult.rows[0] || tickerStats;
      console.log('Ticker stats:', tickerStats);
    } catch (tickerError) {
      console.warn('Could not fetch ticker stats:', tickerError);
    }

    // Calculate analytics
    const totalStocks = stocks.length;
    const stocksWithBuyPrice = stocks.filter((s: any) => s.buy_price && s.buy_price !== '$0').length;
    const avgSentiment = stocks.reduce((sum: number, s: any) => sum + (s.sentiment_score || 0), 0) / totalStocks;
    const avgSignal = stocks.reduce((sum: number, s: any) => sum + (s.signal_score || 0), 0) / totalStocks;
    
    // Source distribution
    const sourceDistribution = stocks.reduce((acc: any, stock: any) => {
      const source = stock.source || 'unknown';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {});

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentStocks = stocks.filter((s: any) => {
      const stockDate = new Date(s.created_at);
      return stockDate >= sevenDaysAgo;
    });

    // Top performers by sentiment
    const topPerformers = stocks
      .filter((s: any) => s.sentiment_score > 0)
      .sort((a: any, b: any) => (b.sentiment_score || 0) - (a.sentiment_score || 0))
      .slice(0, 5);

    // Growth rate analysis
    const stocksWithGrowth = stocks.filter((s: any) => s.last_gr && !isNaN(parseFloat(s.last_gr)));
    const avgGrowthRate = stocksWithGrowth.length > 0 
      ? stocksWithGrowth.reduce((sum: number, s: any) => sum + parseFloat(s.last_gr), 0) / stocksWithGrowth.length 
      : 0;

    const analytics = {
      overview: {
        totalStocks,
        totalTickers: parseInt(tickerStats.total) || 0,
        activeTickers: parseInt(tickerStats.active) || 0,
        stocksWithBuyPrice,
        avgSentiment: Math.round(avgSentiment * 100) / 100,
        avgSignal: Math.round(avgSignal * 100) / 100,
        avgGrowthRate: Math.round(avgGrowthRate * 100) / 100
      },
      distribution: {
        sources: sourceDistribution,
        sentimentRanges: {
          high: stocks.filter((s: any) => (s.sentiment_score || 0) >= 70).length,
          medium: stocks.filter((s: any) => (s.sentiment_score || 0) >= 40 && (s.sentiment_score || 0) < 70).length,
          low: stocks.filter((s: any) => (s.sentiment_score || 0) < 40).length
        }
      },
      activity: {
        recentStocks: recentStocks.length,
        dailyAverage: Math.round((recentStocks.length / 7) * 100) / 100
      },
      topPerformers: topPerformers.map((s: any) => ({
        ticker: s.ticker,
        sentiment_score: s.sentiment_score,
        signal_score: s.signal_score,
        source: s.source
      }))
    };

    console.log('Analytics calculated successfully');
    res.json(analytics);
  } catch (error) {
    console.error('Analytics error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    res.status(500).json({ 
      error: 'Failed to fetch analytics data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};