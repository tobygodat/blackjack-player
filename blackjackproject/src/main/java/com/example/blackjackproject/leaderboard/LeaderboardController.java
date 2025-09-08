package com.example.blackjackproject.leaderboard;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/leaderboard")
@CrossOrigin(origins = "*")
public class LeaderboardController {

    @Autowired
    private LeaderboardService leaderboardService;

    @GetMapping
    public List<Score> getLeaderboard() {
        return leaderboardService.getLeaderboard();
    }

    @PostMapping
    public void addScore(@RequestBody Score score) {
        leaderboardService.addScore(score);
    }
}