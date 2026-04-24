package com.scoreboardx.controller;

import com.scoreboardx.model.RunResponse;
import com.scoreboardx.model.SubmitResponse;
import com.scoreboardx.service.ProgressService;
import com.scoreboardx.service.QuizService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api")
public class QuizController {
    private final QuizService quizService;
    private final ProgressService progressService;

    public QuizController(QuizService quizService, ProgressService progressService) {
        this.quizService = quizService;
        this.progressService = progressService;
    }

    @GetMapping("/run")
    public ResponseEntity<RunResponse> run(@RequestParam String regNo) throws InterruptedException {
        return ResponseEntity.ok(quizService.run(regNo));
    }

    @PostMapping("/submit")
    public ResponseEntity<SubmitResponse> submit(@RequestParam String regNo) {
        return ResponseEntity.ok(quizService.submit(regNo));
    }

    @GetMapping("/progress")
    public SseEmitter progress() {
        return progressService.subscribe();
    }
}
