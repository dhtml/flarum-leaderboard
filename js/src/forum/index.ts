import app from 'flarum/forum/app';
import RankingsPage from "./components/RankingsPage";

app.initializers.add('dhtml/flarum-leaderboard', () => {
  app.routes.leaderboard = { path: '/leaderboard', component: RankingsPage };
});
