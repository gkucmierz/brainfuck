const gulp = require('gulp');
const babel = require('gulp-babel');

gulp.task('build', () => {
  gulp.src('brainfuck.js')
    .pipe(babel({presets: ['es2015']}))
    .pipe(gulp.dest('lib'));
});

gulp.task('default', () => {
  gulp.run('build');
});
