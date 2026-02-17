"use client"

import { useState } from "react"

interface AgentScheduleProps {
  agentId: string
  initialSchedule?: {
    scheduleEnabled: boolean
    scheduleType: string | null
    scheduleTime: string | null
    scheduleDay: string | null
    scheduleCron: string | null
  }
}

export function AgentSchedule({ agentId, initialSchedule }: AgentScheduleProps) {
  const [scheduleEnabled, setScheduleEnabled] = useState(
    initialSchedule?.scheduleEnabled ?? false
  )
  const [scheduleType, setScheduleType] = useState(
    initialSchedule?.scheduleType ?? "daily"
  )
  const [scheduleTime, setScheduleTime] = useState(
    initialSchedule?.scheduleTime ?? "09:00"
  )
  const [scheduleDay, setScheduleDay] = useState(
    initialSchedule?.scheduleDay ?? "monday"
  )
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    setSaved(false)
    
    try {
      const response = await fetch(`/api/agents/${agentId}/schedule`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          scheduleEnabled,
          scheduleType: scheduleEnabled ? scheduleType : null,
          scheduleTime: scheduleEnabled ? scheduleTime : null,
          scheduleDay: scheduleEnabled && scheduleType === "weekly" ? scheduleDay : null
        })
      })

      if (response.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch (error) {
      console.error("Failed to save schedule:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Agent Schedule</h3>
        <label className="flex items-center cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              className="sr-only"
              checked={scheduleEnabled}
              onChange={(e) => setScheduleEnabled(e.target.checked)}
            />
            <div className={`block w-14 h-8 rounded-full transition-colors ${
              scheduleEnabled ? "bg-blue-600" : "bg-gray-600"
            }`}></div>
            <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${
              scheduleEnabled ? "transform translate-x-6" : ""
            }`}></div>
          </div>
          <span className="ml-3 text-gray-300 text-sm">
            {scheduleEnabled ? "Enabled" : "Disabled"}
          </span>
        </label>
      </div>

      {scheduleEnabled && (
        <div className="space-y-4">
          {/* Schedule Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Frequency
            </label>
            <select
              value={scheduleType}
              onChange={(e) => setScheduleType(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="hourly">Every Hour</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>

          {/* Time (for daily/weekly) */}
          {(scheduleType === "daily" || scheduleType === "weekly") && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Time of Day
              </label>
              <input
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Day of Week (for weekly) */}
          {scheduleType === "weekly" && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Day of Week
              </label>
              <select
                value={scheduleDay}
                onChange={(e) => setScheduleDay(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="monday">Monday</option>
                <option value="tuesday">Tuesday</option>
                <option value="wednesday">Wednesday</option>
                <option value="thursday">Thursday</option>
                <option value="friday">Friday</option>
                <option value="saturday">Saturday</option>
                <option value="sunday">Sunday</option>
              </select>
            </div>
          )}

          {/* Schedule Summary */}
          <div className="mt-4 p-3 bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-300">
              <span className="font-medium text-white">Schedule: </span>
              {scheduleType === "hourly" && "Runs every hour"}
              {scheduleType === "daily" && `Runs daily at ${scheduleTime}`}
              {scheduleType === "weekly" && `Runs every ${scheduleDay} at ${scheduleTime}`}
            </p>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="mt-6 flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors"
        >
          {loading ? "Saving..." : "Save Schedule"}
        </button>
        {saved && (
          <span className="text-green-400 text-sm">Schedule saved!</span>
        )}
      </div>
    </div>
  )
}
