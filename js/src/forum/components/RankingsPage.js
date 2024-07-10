import app from 'flarum/forum/app';
import avatar from 'flarum/common/helpers/avatar';
import Page from 'flarum/common/components/Page';
import IndexPage from 'flarum/forum/components/IndexPage';
import Button from 'flarum/common/components/Button';
import LoadingIndicator from 'flarum/common/components/LoadingIndicator';
import listItems from 'flarum/common/helpers/listItems';
import username from 'flarum/common/helpers/username';
import Link from 'flarum/common/components/Link';
import RankingImage from './RankingImage';

/**
 * This page re-uses Flarum's IndexPage CSS classes
 */
export default class RankingsPage extends Page {
  oninit(vnode) {
    super.oninit(vnode);

    if (!app.forum.attribute('canViewRankingPage')) {
      m.route.set('/');
    }

    app.setTitle(app.translator.trans('dhtml-leaderboard.forum.leaderboard'));

    this.loading = true;
    this.users = [];
    this.refresh();
  }

  view() {
    let loading;

    if (this.loading) {
      loading = LoadingIndicator.component();
    } else {
      loading = Button.component(
        {
          className: 'Button',
          onclick: this.loadMore.bind(this),
        },
        app.translator.trans('core.forum.discussion_list.load_more_button')
      );
    }

    return (
      <div className="IndexPage">
        {IndexPage.prototype.hero()}
        <div className="container">
          <div className="sideNavContainer">
            <nav className="IndexPage-nav sideNav">
              <ul>{listItems(IndexPage.prototype.sidebarItems().toArray())}</ul>
            </nav>
            <div className="IndexPage-results sideNavOffset">

              <header class="Hero PageHero">
                <div class="iconcontainer">
                  <div class="fontico"><i class="fas fa-trophy"></i> &nbsp;</div>
                  <div class="icocont">
                    <div class="titolo1">Leaderboard</div>
                  </div>
                </div>
              </header>

              <table class="rankings">
                <tr>
                  <th className="rankings-mobile">{app.translator.trans('fof-gamification.forum.ranking.rank')}</th>
                  <th>{app.translator.trans('fof-gamification.forum.ranking.name')}</th>
                  <th>{app.translator.trans('fof-gamification.forum.ranking.amount')}</th>
                </tr>
                {this.users.map((user, i) => {
                  ++i;
                  return [
                    <tr className={'ranking-' + i}>
                      {i < 4 ? <RankingImage place={i}/> :
                        <td className="rankings-4 rankings-mobile">{this.addOrdinalSuffix(i)}</td>}
                      <td>
                        <div className="PostUser">
                          <h3 className="rankings-info">
                            <Link href={app.route.user(user)} force={true}>
                              {i < 11 ? avatar(user, {className: 'info-avatar rankings-' + i + '-avatar'}) : ''} {username(user)}
                            </Link>
                          </h3>
                        </div>
                      </td>
                      {i < 11 ? <td className={'rankings-' + i}>{user.points()}</td> :
                        <td className="rankings-4">{user.points()}</td>}
                    </tr>,
                  ];
                })}
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  refresh(clear = true) {
    if (clear) {
      this.loading = true;
      this.users = [];
    }

    return this.loadResults().then(
      (results) => {
        this.users = [];
        this.parseResults(results);
      },
      () => {
        this.loading = false;
        m.redraw();
      }
    );
  }

  addOrdinalSuffix(i) {
    if (app.data.locale === 'en') {
      const j = i % 10;
      const k = i % 100;

      if (j === 1 && k !== 11) {
        return i + 'st';
      } else if (j === 2 && k !== 12) {
        return i + 'nd';
      } else if (j === 3 && k !== 13) {
        return i + 'rd';
      }
      return i + 'th';
    } else {
      return i;
    }
  }

  loadResults(offset) {
    const params = {};
    params.page = {
      offset: offset,
      limit: '6',
    };

    return app.store.find('rankings', params);
  }

  loadMore() {
    this.loading = true;

    this.loadResults(this.users.length).then(this.parseResults.bind(this));
  }

  parseResults(results) {
    [].push.apply(this.users, results);

    this.loading = false;

    this.users.sort(function (a, b) {
      return parseFloat(b.points()) - parseFloat(a.points());
    });

    m.redraw();

    return results;
  }
}