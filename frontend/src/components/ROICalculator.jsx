import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  CalculatorIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

export default function ROICalculator() {
  const [claimsPerMonth, setClaimsPerMonth] = useState(1000);
  const [avgProcessingMinutes, setAvgProcessingMinutes] = useState(45);
  const [hourlyRate, setHourlyRate] = useState(35);
  const [errorRate, setErrorRate] = useState(5);

  const calculations = useMemo(() => {
    const currentMonthlyHours = (claimsPerMonth * avgProcessingMinutes) / 60;
    const currentMonthlyCost = currentMonthlyHours * hourlyRate;
    const currentAnnualCost = currentMonthlyCost * 12;
    
    const aiProcessingMinutes = 8;
    const aiMonthlyHours = (claimsPerMonth * aiProcessingMinutes) / 60;
    const aiMonthlyCost = aiMonthlyHours * hourlyRate;
    const aiAnnualCost = aiMonthlyCost * 12;
    
    const subscriptionCost = claimsPerMonth <= 500 ? 499 : 
                             claimsPerMonth <= 2000 ? 2000 : 
                             Math.ceil(claimsPerMonth / 1000) * 1500;
    const annualSubscription = subscriptionCost * 12;
    
    const timeSavedHours = currentMonthlyHours - aiMonthlyHours;
    const timeSavedPercent = Math.round((timeSavedHours / currentMonthlyHours) * 100);
    
    const laborSavings = currentAnnualCost - aiAnnualCost;
    const netSavings = laborSavings - annualSubscription;
    const roi = Math.round((netSavings / annualSubscription) * 100);
    
    const errorCostPerClaim = 150;
    const currentErrorCost = (claimsPerMonth * (errorRate / 100) * errorCostPerClaim) * 12;
    const aiErrorRate = 0.5;
    const aiErrorCost = (claimsPerMonth * (aiErrorRate / 100) * errorCostPerClaim) * 12;
    const errorSavings = currentErrorCost - aiErrorCost;
    
    const totalSavings = netSavings + errorSavings;
    
    return {
      currentMonthlyHours: Math.round(currentMonthlyHours),
      currentAnnualCost: Math.round(currentAnnualCost),
      aiMonthlyHours: Math.round(aiMonthlyHours),
      timeSavedHours: Math.round(timeSavedHours),
      timeSavedPercent,
      laborSavings: Math.round(laborSavings),
      annualSubscription,
      netSavings: Math.round(netSavings),
      roi,
      errorSavings: Math.round(errorSavings),
      totalSavings: Math.round(totalSavings),
      paybackMonths: Math.max(1, Math.round(annualSubscription / (totalSavings / 12)))
    };
  }, [claimsPerMonth, avgProcessingMinutes, hourlyRate, errorRate]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <section className="py-20 px-6 bg-white" id="roi-calculator">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center px-4 py-2 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200 mb-6">
            <CalculatorIcon className="h-4 w-4 mr-2" />
            ROI Calculator
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Calculate Your Savings
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            See exactly how much time and money you'll save with ClarifyOps AI-powered claims processing
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-gray-50 rounded-2xl p-8 border border-gray-100"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />
              Your Current Metrics
            </h3>

            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <DocumentTextIcon className="h-4 w-4" />
                    Claims per Month
                  </label>
                  <span className="text-lg font-bold text-blue-600">{claimsPerMonth.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="10000"
                  step="100"
                  value={claimsPerMonth}
                  onChange={(e) => setClaimsPerMonth(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>100</span>
                  <span>10,000</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <ClockIcon className="h-4 w-4" />
                    Avg Processing Time (minutes)
                  </label>
                  <span className="text-lg font-bold text-blue-600">{avgProcessingMinutes} min</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="120"
                  step="5"
                  value={avgProcessingMinutes}
                  onChange={(e) => setAvgProcessingMinutes(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>15 min</span>
                  <span>120 min</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <UserGroupIcon className="h-4 w-4" />
                    Avg Hourly Rate ($)
                  </label>
                  <span className="text-lg font-bold text-blue-600">${hourlyRate}/hr</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  step="5"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>$20/hr</span>
                  <span>$100/hr</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <ArrowTrendingUpIcon className="h-4 w-4" />
                    Current Error Rate (%)
                  </label>
                  <span className="text-lg font-bold text-blue-600">{errorRate}%</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="15"
                  step="0.5"
                  value={errorRate}
                  onChange={(e) => setErrorRate(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1%</span>
                  <span>15%</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-8 text-white">
              <h3 className="text-lg font-medium mb-2 opacity-90">Estimated Annual Savings</h3>
              <div className="text-5xl font-bold mb-4">
                {formatCurrency(calculations.totalSavings)}
              </div>
              <div className="flex items-center gap-4 text-emerald-100">
                <div className="flex items-center gap-1">
                  <ArrowTrendingUpIcon className="h-5 w-5" />
                  <span>{calculations.roi}% ROI</span>
                </div>
                <div className="flex items-center gap-1">
                  <ClockIcon className="h-5 w-5" />
                  <span>{calculations.paybackMonths} month payback</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                <ClockIcon className="h-8 w-8 text-blue-600 mb-3" />
                <p className="text-sm text-gray-600 mb-1">Time Saved Monthly</p>
                <p className="text-2xl font-bold text-gray-900">{calculations.timeSavedHours.toLocaleString()} hrs</p>
                <p className="text-sm text-blue-600 font-medium">{calculations.timeSavedPercent}% reduction</p>
              </div>

              <div className="bg-purple-50 rounded-xl p-6 border border-purple-100">
                <CurrencyDollarIcon className="h-8 w-8 text-purple-600 mb-3" />
                <p className="text-sm text-gray-600 mb-1">Labor Cost Savings</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(calculations.laborSavings)}</p>
                <p className="text-sm text-purple-600 font-medium">per year</p>
              </div>

              <div className="bg-orange-50 rounded-xl p-6 border border-orange-100">
                <CheckCircleIcon className="h-8 w-8 text-orange-600 mb-3" />
                <p className="text-sm text-gray-600 mb-1">Error Cost Savings</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(calculations.errorSavings)}</p>
                <p className="text-sm text-orange-600 font-medium">fewer rework costs</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <DocumentTextIcon className="h-8 w-8 text-gray-600 mb-3" />
                <p className="text-sm text-gray-600 mb-1">ClarifyOps Investment</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(calculations.annualSubscription)}</p>
                <p className="text-sm text-gray-500 font-medium">annual cost</p>
              </div>
            </div>

            <a
              href="https://calendly.com/taddessebi95"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full px-8 py-4 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors"
            >
              Get Your Custom ROI Analysis
              <ArrowTrendingUpIcon className="h-5 w-5" />
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
