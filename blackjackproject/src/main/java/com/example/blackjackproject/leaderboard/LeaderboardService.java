package com.example.blackjackproject.leaderboard;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service // Tells Spring this is a service class.
public class LeaderboardService {

    @Autowired // Spring: Automatically provides an instance of ScoreRepository.
    private ScoreRepository scoreRepository;

    public List<Score> getLeaderboard() {
        return scoreRepository.findTop10ByOrderByScoreDesc();
    }

    public void addScore(Score score) {
        scoreRepository.save(score);
    }
}