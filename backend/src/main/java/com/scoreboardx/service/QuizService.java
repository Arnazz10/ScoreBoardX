package com.scoreboardx.service;

import com.scoreboardx.model.Event;
import com.scoreboardx.model.LeaderboardEntry;
import com.scoreboardx.model.PollResponse;
import com.scoreboardx.model.RunResponse;
import com.scoreboardx.model.SubmitRequest;
import com.scoreboardx.model.SubmitResponse;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class QuizService {
    private static final String POLL_URL = "https://devapigw.vidalhealthtpa.com/srm-quiz-task/quiz/messages?regNo={regNo}&poll={poll}";
    private static final String SUBMIT_URL = "https://devapigw.vidalhealthtpa.com/srm-quiz-task/quiz/submit";

    private final RestTemplate restTemplate;
    private final ProgressService progressService;
    private final Map<String, List<LeaderboardEntry>> leaderboardCache = new ConcurrentHashMap<>();

    public QuizService(RestTemplate restTemplate, ProgressService progressService) {
        this.restTemplate = restTemplate;
        this.progressService = progressService;
    }

    public RunResponse run(String regNo) throws InterruptedException {
        Set<String> seenEvents = new HashSet<>();
        Map<String, Integer> scoreMap = new HashMap<>();

        for (int poll = 0; poll < 10; poll++) {
            progressService.sendProgress(poll + 1);

            PollResponse response = restTemplate.getForObject(POLL_URL, PollResponse.class, regNo, poll);
            if (response != null && response.getEvents() != null) {
                for (Event event : response.getEvents()) {
                    String key = event.getRoundId() + "|" + event.getParticipant();
                    if (seenEvents.add(key)) {
                        scoreMap.merge(event.getParticipant(), event.getScore(), Integer::sum);
                    }
                }
            }

            if (poll < 9) {
                Thread.sleep(5000);
            }
        }

        List<LeaderboardEntry> leaderboard = new ArrayList<>();
        int total = 0;
        for (Map.Entry<String, Integer> entry : scoreMap.entrySet()) {
            leaderboard.add(new LeaderboardEntry(entry.getKey(), entry.getValue()));
            total += entry.getValue();
        }
        leaderboard.sort(Comparator.comparingInt(LeaderboardEntry::getTotalScore).reversed());
        leaderboardCache.put(regNo, leaderboard);

        RunResponse response = new RunResponse();
        response.setLeaderboard(leaderboard);
        response.setTotalScore(total);
        return response;
    }

    public SubmitResponse submit(String regNo) {
        SubmitRequest request = new SubmitRequest();
        request.setRegNo(regNo);
        request.setLeaderboard(leaderboardCache.getOrDefault(regNo, List.of()));
        return restTemplate.postForObject(SUBMIT_URL, request, SubmitResponse.class);
    }
}
