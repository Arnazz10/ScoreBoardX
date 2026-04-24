package com.scoreboardx.model;

import java.util.ArrayList;
import java.util.List;

public class RunResponse {
    private List<LeaderboardEntry> leaderboard = new ArrayList<>();
    private int totalScore;

    public List<LeaderboardEntry> getLeaderboard() {
        return leaderboard;
    }

    public void setLeaderboard(List<LeaderboardEntry> leaderboard) {
        this.leaderboard = leaderboard;
    }

    public int getTotalScore() {
        return totalScore;
    }

    public void setTotalScore(int totalScore) {
        this.totalScore = totalScore;
    }
}
