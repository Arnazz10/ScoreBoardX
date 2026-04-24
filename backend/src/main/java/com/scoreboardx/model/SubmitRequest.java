package com.scoreboardx.model;

import java.util.ArrayList;
import java.util.List;

public class SubmitRequest {
    private String regNo;
    private List<LeaderboardEntry> leaderboard = new ArrayList<>();

    public String getRegNo() {
        return regNo;
    }

    public void setRegNo(String regNo) {
        this.regNo = regNo;
    }

    public List<LeaderboardEntry> getLeaderboard() {
        return leaderboard;
    }

    public void setLeaderboard(List<LeaderboardEntry> leaderboard) {
        this.leaderboard = leaderboard;
    }
}
